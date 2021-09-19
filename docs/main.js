let onloaded_funcs = [];
let search_index = null;
let search_field = null;
let search_results = [null, null, null];
let current_term = "";

function register_onloaded(fun) {
    onloaded_funcs.push(fun);
}

window.onload = () => {
    onloaded_funcs.forEach((e) => {
        e();
    });
}

register_onloaded(() => {
    document.body.classList.remove("nojs");

    var search_elm = document.getElementById("search");

    if (search_index_url == null) {
        search_elm.remove();
    } else {
        search_field = search_elm.getElementsByTagName("input")[0];
        let tmp = search_elm.getElementsByTagName("div")[0];
        let tmp1 = tmp.getElementsByTagName("div");

        search_results[0] = tmp1[0];
        search_results[1] = tmp1[1];

        search_results[2] = tmp.getElementsByTagName("ul")[0];

        search_field.autocomplete = "off";

        search_field.onkeyup = () => {
            if (search_index == null) {
                let xhr = new XMLHttpRequest();
                xhr.open("get", search_index_url);
                xhr.onreadystatechange = () => {
                    if (xhr.readyState == xhr.DONE && xhr.status == 200) {
                        if (xhr.status == 200) {
                            try {
                                search_index = elasticlunr.Index.load(JSON.parse(xhr.responseText));
                                search();
                            } catch {
                                search_field = null;
                                search_results = null;
                                try {
                                    document.getElementById("search").remove();
                                } catch { }
                            }
                        } else {
                            search_field = null;
                            search_results = null;
                            try {
                                document.getElementById("search").remove();
                            } catch { }
                        }
                    }
                };
                xhr.send();
            } else {
                search();
            }
        };
    }
});

function search() {
    if (search_index != null && search_field != null) {
        let term = search_field.value.trim();

        if (term != current_term) {
            current_term = term;

            if (term != "") {
                search_results[2].innerHTML = "";

                search_results[0].style.display = "";
                search_results[1].style.display = "none";
                search_results[2].style.display = "none";

                let res = search_index.search(term, {
                    fields: {
                        title: { boost: 2, bool: "AND", expand: true },
                        body: { boost: 1 }
                    },
                    bool: "OR"
                });

                if (res.length > 0) {
                    search_results.innerHTML = ""
                    for (var i = 0; i < Math.min(res.length, 4); i++) {
                        var item = document.createElement("li");
                        var link = document.createElement("a");
                        link.href = res[i].ref;
                        link.innerText = res[i].doc.title;
                        item.appendChild(link);
                        search_results[2].appendChild(item);
                    }
                    search_results[0].style.display = "none";
                    search_results[1].style.display = "none";
                    search_results[2].style.display = "";
                } else {
                    search_results[0].style.display = "none";
                    search_results[1].style.display = "";
                    search_results[2].style.display = "none";
                }
            }
        }
    }
}