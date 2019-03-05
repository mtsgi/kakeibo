$(document).ready(Load);
var about = "JS家計簿 v1.1<br>クライアントサイドだけ(データベースなど使わない)で動作する軽量JavaScript家計簿アプリです。家計簿データはブラウザにドメインごとに保持されています(IE7以下は非対応です)。"
var portUsage = "<div style='font-size:15px'>・ファイルを選択するとインポートできます。<br>・ボタンを押すとエクスポートできます。</div>";
function Load() {
    if (!localStorage.getItem("kb-password")) {
        $("#lock").hide();
        $("#current_pass").text("未設定です");
    }
    else $("#current_pass").text("設定済みです");
    listLoad();
    if (localStorage.getItem("kb-name")) {
        $("#myname").text(localStorage.getItem("kb-name"));
    }
    //名前
    $("#myname").click(function () {
        $("#popup-name").toggle();
        $("#name-cur").text(localStorage.getItem("kb-name"));
        $("#new-name").val(localStorage.getItem("kb-name"));
    });
    //名前の登録
    $("#name-add").click(function () {
        localStorage.setItem("kb-name", $("#new-name").val());
        $("#myname").text(localStorage.getItem("kb-name"));
        $("#popup-name").hide();
        popupAlert("名前の登録", $("#new-name").val() + "という名前を登録しました。");
    });
    //名前の削除
    $("#name-remove").click(function () {
        localStorage.removeItem("kb-name");
        $("#myname").text("名前を登録");
        $("#popup-name").hide();
        popupAlert("名前の削除", "名前の削除が完了しました。");
    });
    //支出
    $("#add-out").click(function () {
        $("#popup-out").show();
    });
    //支出項目の追加
    $("#out-add").click(function () {
        if (isNaN($("#out-price").val())) {
            popupAlert("金額エラー", "金額が非数のため登録できません。");
            return false;
        }
        if ($("#out-name").val().length == 0) {
            popupAlert("名称エラー", "名称は1文字以上入力してください。");
            return false;
        }
        if (localStorage.getItem("kb-out-" + $("#out-name").val())) {
            popupAlert("支出項目の重複", $("#out-name").val() + "という名前の支出項目は既に登録されています。別の名前を入力してください。");
            return false;
        }
        localStorage.setItem("kb-out-" + $("#out-name").val(), Number($("#out-price").val()));
        listLoad();
        $("#popup-out").hide();
    });

    //収入
    $("#add-inc").click(function () {
        $("#popup-inc").show();
    });
    //収入項目の追加
    $("#inc-add").click(function () {
        if (isNaN($("#inc-price").val())) {
            popupAlert("金額エラー", "金額が非数のため登録できません。");
            return false;
        }
        if ($("#inc-name").val().length == 0) {
            popupAlert("名称エラー", "名称は1文字以上入力してください。");
            return false;
        }
        if (localStorage.getItem("kb-inc-" + $("#inc-name").val())) {
            popupAlert("収入項目の重複", $("#inc-name").val() + "という名前の収入項目は既に登録されています。別の名前を入力してください。");
            return false;
        }
        localStorage.setItem("kb-inc-" + $("#inc-name").val(), Number($("#inc-price").val()));
        listLoad();
        $("#popup-inc").hide();
    });

    //パスワードとセキュリティ
    $("#set-pass").click(function () {
        localStorage.setItem("kb-password", $("#lock-pass").val());
    });
    $("#unlock").click(function () {
        if ($("#pass").val() == localStorage.getItem("kb-password")) $("#lock").hide();
        else popupAlert("パスワード", "パスワードが違います");
    });
    var resetSecret = 0;
    $("#reset_secret").click(function(){
        if( resetSecret > 20 ) location.href = "kakeibo-password-reset.html";
        resetSecret ++;
    })

    //全削除
    $("#ac-do").click(function () {
        localStorage.clear();
        listLoad();
        $(".popup").hide();
        popupAlert("全削除の完了", "全てのデータを削除しました。");
    });

    //エクスポート
    $("#set-port").click(function () {
        $("#popup-port").show();
    });
    $("#export, #export2").click(function () {
        if (!localStorage.getItem("kb-name")) {
            popupAlert("エラー", "家計簿のデータをエクスポートするには名前を登録する必要があります。");
            return false;
        }
        var expfile = "";
        if ($(this)[0].id == "export") expfile = encodeURI(JSON.stringify(localStorage));
        else expfile = JSON.stringify(localStorage);
        $("#portarea").text(expfile);
        var blob = new Blob([expfile], { type: "application/json" });
        $("#export-dl").attr("href", URL.createObjectURL(blob));
        $("#export-dl").attr("download", "kb-" + localStorage.getItem("kb-name") + ".json");
        popupAlert("エクスポート完了", "kb-" + localStorage.getItem("kb-name") + ".jsonというファイルを出力しました。ダウンロードボタンからデータを取得してください。");
    });
    //インポート
    var form = document.forms.myform;
    form.myfile.addEventListener('change', function (e) {
        var result = e.target.files[0];
        console.log(result);
        var reader = new FileReader();
        reader.readAsText(result);
        reader.addEventListener('load', function () {
            $("#portarea").text(reader.result);
            $("#popup-port .comment").hide();
            var appendImport = "<div class='comment'>" + result.name + "が選択されました<br><a class='button import-add'>現在のシートに追加インポート</a><br><a class='button import-new'>新規シートとしてインポート</a></div>";
            $("#popup-port .popup-content").append(appendImport);
            var importFile = JSON.parse(decodeURI(reader.result));
            $(".import-add").click(function () {
                var kosuu = 0;
                var uwa = 0;
                var fail = 0;
                for (i in importFile) {
                    if (localStorage.getItem(i)) uwa++;
                    if (i.indexOf("kb-") != -1) {
                        localStorage.setItem(i, importFile[i]);
                        kosuu++;
                    }
                    else fail++;
                }
                $("#myname").text(localStorage.getItem("kb-name"));
                popupAlert("追加インポート", "現在のシートにファイル" + result.name + "から新たに" + kosuu + "個のデータを追加で読み込みました(うち" + uwa + "個は上書き／" + fail + "個の失敗データ)。");
                listLoad();
            });
            $(".import-new").click(function () {
                var kosuu = 0;
                var fail = 0;
                localStorage.clear();
                for (i in importFile) {
                    if (i.indexOf("kb-") != -1) {
                        localStorage.setItem(i, importFile[i]);
                        kosuu++;
                    }
                    else fail++;
                }
                $("#myname").text(localStorage.getItem("kb-name"));
                popupAlert("新規インポート", "既存のシート内容を削除し、ファイル" + result.name + "から" + kosuu + "個のデータを新規で読み込みました(" + fail + "個の失敗データ)。");
                listLoad();
            });
        })
    })
}
function listLoad() {
    $("#out-area").html("");
    $("#inc-area").html("");
    var outSum = 0;
    var incSum = 0;
    for (i in localStorage) {
        if (i.indexOf("kb-out-") != -1) {
            var append = "<div class='item'><span>" + i.slice(7) + "</span>" + localStorage[i] + "円<a onclick='localStorage.removeItem(\"" + i + "\");popupAlert(\"削除の完了\",\"支出項目を削除しました。\")'>削除</a><a onclick='kingaku(\"" + i + "\")'>編集</a></div>";
            $("#out-area").append(append);
            outSum += Number(localStorage[i]);
        }
        else if (i.indexOf("kb-inc-") != -1) {
            var append = "<div class='item'><span>" + i.slice(7) + "</span>" + localStorage[i] + "円<a onclick='localStorage.removeItem(\"" + i + "\");popupAlert(\"削除の完了\",\"収入項目を削除しました。\")'>削除</a><a onclick='kingaku(\"" + i + "\")'>編集</a></div>";
            $("#inc-area").append(append);
            incSum += Number(localStorage[i]);
        }
    }
    $("#out-sum").text(outSum);
    $("#inc-sum").text(incSum);

    //削除ボタン押下
    $(".item a").click(function () {
        //popupAlert("削除の完了","項目を削除しました");
        listLoad();
    });
    //収支計算
    $("#inc-out-inc").text(incSum);
    $("#inc-out-out").text(outSum);
    var ioSum = incSum - outSum;
    if (ioSum >= 0) {
        $("#inc-out-sum").text(ioSum + "円");
        $("#inc-out-sum").css("color", "lime");
    }
    else {
        $("#inc-out-sum").text("マイナス" + (-1 * ioSum) + "円");
        $("#inc-out-sum").css("color", "orange");
    }
}
function kingaku(str) {
    $("#kingaku-name").text(str.slice(7));
    $("#kingaku-price").val(localStorage.getItem(str));
    $("#kingaku-add").off().click(function () {
        if (isNaN($("#kingaku-price").val())) {
            popupAlert("金額エラー", "金額が非数のため登録できません。");
            return false;
        }
        localStorage.setItem(str, $("#kingaku-price").val());
        $("#popup-kingaku").hide();
        popupAlert("金額の変更", str.slice(7) + "の金額を" + $("#kingaku-price").val() + "円に変更しました。");
        listLoad();
    });
    $("#popup-kingaku").show();
}
function popupAlert(title, content) {
    $("#popup-alert-title").text(title);
    var alertClose = "<a class='button' style='display:block' onclick='$(\"#popup-alert\").hide()'>閉じる</a>";
    $("#popup-alert .popup-content").html(content + alertClose);
    $("#popup-alert").show();
}