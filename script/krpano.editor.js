var krpano = document.getElementById("krpanoSWFObject");
var sceneList = [];
var toAddHotSpot = {};
var currentSceneIndex = 0;
var movingSpot = {};
//视角拖动模块变量
var pbX = 0;
var movePx = 0;
var moveFastPx = 0;
var moveIntervalId;
var listIntervalId;
var listPx = 0;
var listFastPx = 0;
var canDownMove = false;
var canLeftMove = false;
var canRightMove = false;
var canShowLeft = true;

$(function () {

    //右侧功能选择
    $(".J-tool-btn").click(function () {
        $(".J-tool-btn").each(function () {
            $(this).removeClass("btn-blue");
            $("[name=" + $(this).attr("data-target") + "]").hide();
        });
        $(this).addClass("btn-blue");
        $("[name=" + $(this).attr("data-target") + "]").show();
        window.clearInterval(moveIntervalId);
        $(".add-hot-pot").hide();
    });

    //视角拖动条
    $(".triangle-down").mouseup(function () {
        canDownMove = false;
    }).mouseout(function () {
        canDownMove = false;
    });
    $(".triangle-up-left").mouseup(function () {
        canLeftMove = false;
    }).mouseout(function () {
        canLeftMove = false;
    });
    $(".triangle-up-right").mouseup(function () {
        canRightMove = false;
    }).mouseout(function () {
        canRightMove = false;
    });

    //添加热点模块
    $(".hot-style").click(function () {
        toAddHotSpot.style = $(this).attr("name");
        $(".hot-style").removeClass("hot-style-on");
        $(this).addClass("hot-style-on");
    });
    $(this).mousemove(function () {
        if (canShowLeft) {
            if (krpano.get("mouse.x") <= 300) {
                $(".left-column").css("-webkit-animation", "showLeft 0.8s infinite").css("-webkit-animation-iteration-count", "1")
                    .css("left", "0");
            } else {
                $(".left-column").css("-webkit-animation", "hideLeft 0.8s infinite").css("-webkit-animation-iteration-count", "1")
                    .css("left", "-250px");
            }
        }
    });

    $(".my-open-out").click(function () {
        if (toAddHotSpot.dive) {
            toAddHotSpot.dive = false;
            $(this).css("background", "rgba(255,255,255,0.4)");
            $(".my-open-in").removeClass("my-open-in-open").addClass("my-open-in-close");
        } else {
            toAddHotSpot.dive = true;
            $(this).css("background", "#00a3d8");
            $(".my-open-in").removeClass("my-open-in-close").addClass("my-open-in-open");
        }
    });
});

//noinspection JSUnusedGlobalSymbols
function onready() {

    //初始化场景选择列表
    var sceneListHTML;
    var dataSceneList = {list: []};
    krpano.get("scene").getArray().forEach(function (scene) {
        dataSceneList.list.push({name: scene.name, index: scene.index});
    });
    sceneListHTML = template('tplSceneList', dataSceneList);
    document.getElementById('sceneList').innerHTML = sceneListHTML;
    //初始化选中以及首场景
    $("li[name=" + krpano.get("startscene") + "] .circle").css("background-color", "#FF9800");
    $("li[name=" + krpano.get("xml.scene") + "]").addClass("li-scene-hover");
    currentSceneIndex = krpano.get("scene").getItem(krpano.get("xml.scene")).index;
    //热点列表模块
    var hotSpotHTML;
    var dataHotSpotList = {list: []};
    //覆盖原热点选中事件,添加热点点击移动事件
    krpano.get("hotspot").getArray().forEach(function (oldHotSpot) {
        if (oldHotSpot.name != "vr_cursor") {
            dataHotSpotList.list.push(oldHotSpot);
            hotSpotInitEvent(oldHotSpot.name);
        }
    });
    hotSpotHTML = template('tplHotSpotList', dataHotSpotList);
    document.getElementById('hotSpotList').innerHTML = hotSpotHTML;
    //热点动画
    listIntervalId = setInterval(spotAutoGif, 30);

    //右侧数值初始化
    $("#waitTime").val(krpano.get("autorotate.waittime"));
    if (krpano.get("autorotate.enabled")) {
        $("#autoSpin").prop("checked", true);
        $("#waitTimeInput").show();
    } else {
        $("#autoSpin").prop("checked", false);
        $("#waitTimeInput").hide();
    }
    $("#initFov").val(krpano.get("view.fov").toFixed(0));
    $("#initFovMax").val(krpano.get("view.fovmax").toFixed(0));
    $("#initFovMin").val(krpano.get("view.fovmin").toFixed(0));
    updatePbLine();
    initPbLineEvent();

    //初始化提交数据
    if (!sceneList.length) {
        krpano.get("scene").getArray().forEach(function (scene) {
            var sceneObj = {};
            sceneObj.index = scene.index;
            sceneObj.name = scene.name;
            if (scene.name == krpano.get("startscene")) {
                sceneObj.welcomeFlag = true;
            }
            sceneList.push(sceneObj);
        });
    }
}

//场景切换，重命名模块
function changeScene(index) {
    window.clearInterval(listIntervalId);
    krpano.call("loadscene(" + krpano.get("scene").getItem(index).name + ")");
    //当前存储对象展示
    var currentScene = sceneList[index];
    if (currentScene.initH != null) krpano.set("view.hlookat", currentScene.initH);
    if (currentScene.initV != null) krpano.set("view.vlookat", currentScene.initV);
    if (currentScene.fov != null) krpano.set("view.fov", currentScene.fov);
    if (currentScene.fovmax != null) krpano.set("view.fovmax", currentScene.fovmax);
    if (currentScene.fovmin != null) krpano.set("view.fovmin", currentScene.fovmin);
    if (currentScene.autorotate != null) {
        krpano.set("autorotate.enabled", currentScene.autorotate.enabled);
        krpano.set("autorotate.waittime", currentScene.autorotate.waitTime);
    }
    if (currentScene.hotSpots != null) {
        krpano.get("hotspot").getArray().forEach(function (everySpot) {
            if (everySpot.name != "vr_cursor") {
                krpano.call("removehotspot(" + everySpot.name + ")");
            }
        });
        currentScene.hotSpots.forEach(function (everySpot) {
            krpano.call("addhotspot(" + everySpot.name + ");");
            krpano.set("hotspot[" + everySpot.name + "].ath", everySpot.ath);
            krpano.set("hotspot[" + everySpot.name + "].atv", everySpot.atv);
            krpano.set("hotspot[" + everySpot.name + "].title", everySpot.title);
            krpano.set("hotspot[" + everySpot.name + "].linkedscene", everySpot.linkedscene);
            krpano.set("hotspot[" + everySpot.name + "].dive", everySpot.dive);
            krpano.get("hotspot[" + everySpot.name + "]").loadstyle(everySpot.style);
        });
    }
    $('.li-scene-hover').removeClass('li-scene-hover');
    $("li[name=" + krpano.get("xml.scene") + "]").addClass("li-scene-hover");
    $(".circle").css("background-color", "#292827");
    sceneList.forEach(function (scene) {
        if (scene.welcomeFlag) {
            $(".circle:eq(" + scene.index + ")").css("background-color", "#FF9800");
            krpano.set("startscene", scene.name);
        }
    });
}

function rename(prevButton) {
    prevButton.prev().hide();
    prevButton.attr("type", "text");
    var focusValue = prevButton.val();
    prevButton.val("");
    prevButton.focus();
    prevButton.val(focusValue);
}

function doRename(thisInput) {
    var nameIndex = thisInput.parent().attr('key');
    var newName = thisInput.val();
    var oldName = krpano.get("scene").getItem(nameIndex).name;
    var doFlag = true;
    //判断名字是否重复
    sceneList.forEach(function (eachScene) {
        if (eachScene.index != nameIndex) {
            if(eachScene.name == newName){
                doFlag = false;
                return false;
            }
        }
    });
    if(doFlag){
        krpano.get("scene").renameItem(oldName, newName);
        if (currentSceneIndex == nameIndex) {
            krpano.set("xml.scene", newName);
        }
        if (oldName == krpano.get("startscene")) {
            krpano.set("startscene", newName);
        }
        sceneList[nameIndex].name = newName;
        //修改热点指向场景名字
        sceneList.forEach(function (eachScene) {
            if (eachScene.index != nameIndex && eachScene.hotSpots) {
                eachScene.hotSpots.forEach(function (eachSpot) {
                    if (eachSpot.linkedscene == oldName) {
                        eachSpot.linkedscene = newName;
                        eachSpot.title = newName;
                        krpano.set("hotspot[" + eachSpot.name + "].title", newName);
                        krpano.set("hotspot[" + eachSpot.name + "].linkedscene", newName);
                    }
                });
            }
        });
        $(".hot-spot-text").each(function () {
            if ($(this).text() == oldName) {
                $(this).text(newName);
            }
        });
        $("#isEdited").text('保存*');
        thisInput.prev().text(newName);
    }else{
        thisInput.val(oldName);
        alert("名字重复");
    }
    thisInput.prev().show();
    thisInput.attr("type", "hidden");
}

function selectWelcomeScene(index) {
    $(".circle").css("background-color", "#292827");
    $(".circle:eq(" + index + ")").css("background-color", "#FF9800");
    sceneList.forEach(function (scene) {
        scene.welcomeFlag = false;
    });
    sceneList[index].welcomeFlag = true;
    $("#isEdited").text('保存*');
}

//视角修改模块
function setAsDefaultView() {
    sceneList[currentSceneIndex].initH = krpano.get("view.hlookat");
    sceneList[currentSceneIndex].initV = krpano.get("view.vlookat");
    sceneList[currentSceneIndex].fov = krpano.get("view.fov");
    $("#initFov").val(krpano.get("view.fov").toFixed(0));
    updatePbLine();
    $("#isEdited").text('保存*');
}

function autoSpinClick() {
    var isChecked = $("#autoSpin").is(":checked");
    if (isChecked) {
        $("#waitTimeInput").show();
    } else {
        $("#waitTimeInput").hide();
    }
    krpano.set("autorotate.enabled", isChecked);
    krpano.set("autorotate.waittime", $("#waitTime").val());
    krpano.get("scene").getArray().forEach(function (scene) {
        sceneList[scene.index].autorotate = {enabled: $("#autoSpin").is(":checked"), waitTime: $("#waitTime").val()};
    });
    $("#isEdited").text('保存*');
}

function updateFov() {
    var fov = $("#initFov").val();
    var fovMax = $("#initFovMax").val();
    var fovMin = $("#initFovMin").val();
    if (fov == "" || Number(fov) > 180 || Number(fov) < 0) {
        $("#initFov").val(krpano.get("view.fov").toFixed(0));
        return
    }
    if (fovMax == "" || Number(fovMax) > 180 || Number(fovMax) < 0) {
        $("#initFovMax").val(krpano.get("view.fovmax").toFixed(0));
        return
    }
    if (fovMin == "" || Number(fovMin) > 180 || Number(fovMin) < 0) {
        $("#initFovMin").val(krpano.get("view.fovmin").toFixed(0));
        return
    }
    krpano.set("view.fov", fov);
    krpano.set("view.fovmax", fovMax);
    krpano.set("view.fovmin", fovMin);
    sceneList[currentSceneIndex].fov = fov;
    sceneList[currentSceneIndex].fovmax = fovMax;
    sceneList[currentSceneIndex].fovmin = fovMin;
    updatePbLine();
    $("#isEdited").text('保存*');
}

function fovForAll() {
    sceneList.forEach(function (eachScene) {
        eachScene.fov = $("#initFov").val();
        eachScene.fovmax = $("#initFovMax").val();
        eachScene.fovmin = $("#initFovMin").val();
    });
    $("#isEdited").text('保存*');
    alert("操作成功");
}

function updatePbLine() {
    //视角条
    var startPx = Number(krpano.get("view.fovmin")) / 0.9;
    var widthPx = Number(krpano.get("view.fovmax")) / 0.9 - startPx;
    var currPx = Number(krpano.get("view.fov")) / 0.9 - startPx - 10;
    $(".triangle-down").css("margin-left", currPx.toFixed(0) + "px");
    $(".number-pb-shown").css("left", startPx.toFixed(0) + "px").css("width", widthPx.toFixed(0) + "px").show();
}

function initPbLineEvent() {
    $(".triangle-down").unbind("mousedown").mousedown(function () {
        pbX = krpano.get("mouse.x");
        canDownMove = true;
    }).unbind("mousemove").mousemove(function () {
        if (canDownMove) {
            moveDownLine();
        }
    });
    $(".triangle-up-left").unbind("mousedown").mousedown(function () {
        pbX = krpano.get("mouse.x");
        canLeftMove = true;
    }).unbind("mousemove").mousemove(function () {
        if (canLeftMove) {
            moveLeftLine();
        }
    });
    $(".triangle-up-right").unbind("mousedown").mousedown(function () {
        pbX = krpano.get("mouse.x");
        canRightMove = true;
    }).unbind("mousemove").mousemove(function () {
        if (canRightMove) {
            moveRightLine();
        }
    });
}

function moveDownLine() {
    var startPx = Number(krpano.get("view.fovmin")) / 0.9;
    var widthPx = Number(krpano.get("view.fovmax")) / 0.9 - startPx;
    var leftPx = Number(krpano.get("view.fov")) / 0.9 - startPx - 10 + krpano.get("mouse.x") - pbX;
    if (leftPx + 10 < 0) {
        canDownMove = false;
        leftPx = -10;
    }
    if (leftPx + 10 > widthPx) {
        canDownMove = false;
        leftPx = widthPx - 10;
    }
    pbX = krpano.get("mouse.x");
    krpano.set("view.fov", (leftPx + 10 + startPx) * 0.9);
    $(".triangle-down").css("margin-left", leftPx.toFixed(0) + "px");
    $("#initFov").val(krpano.get("view.fov").toFixed(0));
    sceneList[currentSceneIndex].fov = krpano.get("view.fov");
    $("#isEdited").text('保存*');
}

function moveLeftLine() {
    var startPx = Number(krpano.get("view.fovmin")) / 0.9 + krpano.get("mouse.x") - pbX;
    var endPx = Number(krpano.get("view.fovmax")) / 0.9;
    if (startPx < 0) {
        startPx = 0;
        canLeftMove = false;
    }
    if (endPx - startPx < 20) {
        startPx = endPx - 20;
        canLeftMove = false;
    }
    if (krpano.get("view.fov") < krpano.get("view.fovmin")) {
        krpano.set("view.fov", krpano.get("view.fovmin"))
    }
    pbX = krpano.get("mouse.x");
    krpano.set("view.fovmin", startPx * 0.9);
    updatePbLine();
    $("#initFovMin").val(krpano.get("view.fovmin").toFixed(0));
    sceneList[currentSceneIndex].fovmin = krpano.get("view.fovmin");
    $("#isEdited").text('保存*');
}

function moveRightLine() {
    var startPx = Number(krpano.get("view.fovmin")) / 0.9;
    var endPx = Number(krpano.get("view.fovmax")) / 0.9 + krpano.get("mouse.x") - pbX;
    if (endPx > 200) {
        endPx = 200;
        canRightMove = false;
    }
    if (endPx - startPx < 20) {
        endPx = startPx + 20;
        canRightMove = false;
    }
    if (krpano.get("view.fov") > krpano.get("view.fovmax")) {
        krpano.set("view.fov", krpano.get("view.fovmax"))
    }
    pbX = krpano.get("mouse.x");
    krpano.set("view.fovmax", endPx * 0.9);
    updatePbLine();
    $("#initFovMax").val(krpano.get("view.fovmax").toFixed(0));
    sceneList[currentSceneIndex].fovmax = krpano.get("view.fovmax");
    $("#isEdited").text('保存*');
}

//提交表单修改模块
function updateHotSpotData() {
    var hotSpotHTML;
    var dataHotSpotList = {list: []};
    //修改全局变量
    var hotSpotData = [];
    krpano.get("hotspot").getArray().forEach(function (everySpot) {
        if (everySpot.name != "vr_cursor") {
            dataHotSpotList.list.push(everySpot);
            var hotSpot = {};
            hotSpot.ath = everySpot.ath.toString();
            hotSpot.atv = everySpot.atv.toString();
            hotSpot.linkedscene = everySpot.linkedscene;
            hotSpot.name = everySpot.name;
            hotSpot.style = everySpot.style;
            hotSpot.title = everySpot.title;
            hotSpot.dive = everySpot.dive;
            hotSpotData.push(hotSpot);
        }
    });
    sceneList[currentSceneIndex].hotSpots = hotSpotData;
    hotSpotHTML = template('tplHotSpotList', dataHotSpotList);
    document.getElementById('hotSpotList').innerHTML = hotSpotHTML;
}

function getQueryString(url) {
    url = url ? url : window.location.search;
    var theRequest = {};
    if (url.indexOf("?") != -1) {
        var str = url.split('?')[1];
        var strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            var encodeValue = strs[i].split('=')[1].replace(/\+/g, '%20');
            theRequest[strs[i].split("=")[0]] = decodeURIComponent(encodeValue);
        }
    }
    return theRequest;
}

function save() {
    if ($("#isEdited").text() == '保存') {
        return;
    }
    var postData = JSON.stringify(sceneList);
    var projectName = getQueryString().projectName;
    $.ajax({
        type: 'POST',
        contentType: "application/json; charset=utf-8",
        url: "http://192.168.33.125:8080/api/editor/" + encodeURIComponent(projectName) + "/save",
        data: postData,
        success: function (data) {
            alert(data);
            if (data == "保存成功") {
                $("#isEdited").text('保存');
            }
        },
        error: function () {
            alert("系统错误");
        }
    });
}

//热点移动模块
function autoMove() {
    krpano.call("screentosphere(mouse.x, mouse.y, mouseath, mouseatv);");
    krpano.set("hotspot[" + movingSpot.name + "].ath", krpano.get("mouseath") + movingSpot.athDis);
    krpano.set("hotspot[" + movingSpot.name + "].atv", krpano.get("mouseatv") + movingSpot.atvDis);
}

//添加热点模块
function showAddHotSpot() {
    moveIntervalId = setInterval(addSpotAutoGif, 30);
    $(".hot-style").removeClass("hot-style-on");
    $(".hot-style").first().addClass("hot-style-on");
    toAddHotSpot.style = $(".hot-style").first().attr("name");
    toAddHotSpot.dive = true;
    $(".my-open-out").css("background", "#00a3d8");
    $(".my-open-in").removeClass("my-open-in-close").addClass("my-open-in-open");
    $("#hotToolButton").hide();
    $(".add-hot-pot").show();
    $("#selectStyle").show();
    $("#goToScene").hide();
    $("#writeTitle").hide();
    $("#selectStyleTitle").addClass("progress-title-on");
    $("#goToSceneTitle").removeClass("progress-title-on");
    $("#writeTitleTitle").removeClass("progress-title-on");
}

function spotAutoGif() {
    listPx -= 32;
    listFastPx -= 32;
    if (listFastPx == -128 * 10) {
        listFastPx = 0;
    }
    if (listPx == -128 * 25) {
        listPx = 0;
    }
    $(".hot-spot-img").each(function () {
        if ($(this).attr("spot-style") == 'hotspot_3') {
            $(this).css("background-position", "0 " + listFastPx + "px");
        } else {
            $(this).css("background-position", "0 " + listPx + "px");
        }
    });
}

function addSpotAutoGif() {
    movePx -= 64;
    moveFastPx -= 64;
    if (moveFastPx == -128 * 10) {
        moveFastPx = 0;
    }
    if (movePx == -128 * 25) {
        movePx = 0;
    }
    $(".hot-style").each(function () {
        if ($(this).attr("name") == 'hotspot_3') {
            $(this).css("background-position", "0 " + moveFastPx + "px");
        } else {
            $(this).css("background-position", "0 " + movePx + "px");
        }
    });
}

function hideAddHotSpot() {
    window.clearInterval(moveIntervalId);
    toAddHotSpot = {};
    $(".add-hot-pot").hide();
    $("span[data-target=#toolHot]").click();
}

function nextToSelectTargetScene() {
    if (toAddHotSpot.style == null) {
        alert("请选择热点样式");
        return
    }

    window.clearInterval(moveIntervalId);

    // 目标场景列表
    var targetSceneHTML;
    var dataTargetScene = {list: []};
    krpano.get("scene").getArray().forEach(function (scene) {
        if (scene.name != krpano.get('xml.scene')) {
            dataTargetScene.list.push({name: scene.name, index: scene.index + 1})
        }
    });
    targetSceneHTML = template('tplTargetScene', dataTargetScene);
    document.getElementById('targetScene').innerHTML = targetSceneHTML;

    $(".select-scene-div").removeClass("select-scene-div-on");
    $(".select-scene-div").first().addClass("select-scene-div-on");
    toAddHotSpot.linkedscene = $(".select-scene-div").first().attr("name");
    $(".select-scene-div").unbind("click").click(function () {
        toAddHotSpot.linkedscene = $(this).attr("name");
        $(".select-scene-div").removeClass("select-scene-div-on");
        $(this).addClass("select-scene-div-on");
    });

    $("#selectStyle").hide();
    $("#goToScene").show();
    $("#writeTitle").hide();
    $("#goToSceneTitle").addClass("progress-title-on");
    $("#selectStyleTitle").removeClass("progress-title-on");
    $("#writeTitleTitle").removeClass("progress-title-on");
}

function nextToWriteTitle() {
    if (toAddHotSpot.linkedscene == null) {
        alert("请选择目标场景");
        return;
    }

    $("#addHotTitle").val(toAddHotSpot.linkedscene);

    $("#selectStyle").hide();
    $("#goToScene").hide();
    $("#writeTitle").show();
    $("#writeTitleTitle").addClass("progress-title-on");
    $("#selectStyleTitle").removeClass("progress-title-on");
    $("#goToSceneTitle").removeClass("progress-title-on");
}

function addHotSpot() {
    // 计算中间位置的球面坐标
    krpano.set("halfHeight", krpano.get("stageheight") / 2);
    krpano.set("halfWidth", krpano.get("stagewidth") / 2);
    krpano.call("screentosphere(halfWidth,halfHeight,init_h,init_v);");
    var init_h = krpano.get("init_h");
    var init_v = krpano.get("init_v");
    //添加热点
    var newHotSpotName = "spot" + new Date().getTime();
    krpano.call("addhotspot(" + newHotSpotName + ");");
    krpano.set("hotspot[" + newHotSpotName + "].ath", init_h);
    krpano.set("hotspot[" + newHotSpotName + "].atv", init_v);
    krpano.set("hotspot[" + newHotSpotName + "].title", $("#addHotTitle").val());
    krpano.set("hotspot[" + newHotSpotName + "].linkedscene", toAddHotSpot.linkedscene);
    krpano.set("hotspot[" + newHotSpotName + "].dive", toAddHotSpot.dive);
    krpano.get("hotspot[" + newHotSpotName + "]").loadstyle(toAddHotSpot.style);
    hotSpotInitEvent(newHotSpotName);
    updateHotSpotData();
    $("#isEdited").text('保存*');
    hideAddHotSpot();
    $("span[data-target=#toolHot]").click();
}

//热点选择模块
function selectHotSpot() {
    krpano.call("screentosphere(mouse.x, mouse.y, mouseath, mouseatv);");
    var nearHotSpot = {};
    krpano.get("hotspot").getArray().forEach(function (thisHotSpot) {
        var thisAthDis = krpano.get("hotspot[" + thisHotSpot.name + "]").ath - krpano.get("mouseath");
        var thisAtvDis = krpano.get("hotspot[" + thisHotSpot.name + "]").atv - krpano.get("mouseatv");
        var thisDis = Math.abs(thisAthDis) + Math.abs(thisAtvDis);
        if (nearHotSpot.name == null) {
            nearHotSpot = {name: thisHotSpot.name, athDis: thisAthDis, atvDis: thisAtvDis, dis: thisDis};
        } else {
            if (thisDis < nearHotSpot.dis) {
                nearHotSpot = {name: thisHotSpot.name, athDis: thisAthDis, atvDis: thisAtvDis, dis: thisDis};
            }
        }
    });
    return nearHotSpot;
}

function hotSpotInitEvent(spotName) {
    krpano.get("hotspot[" + spotName + "]").ondown = function () {
        movingSpot = selectHotSpot();
        var intervalId = setInterval(autoMove, 1000.0 / 30.0);
        krpano.set("autoMoveIntervalId", intervalId);
        canShowLeft = false;
    };
    krpano.get("hotspot[" + spotName + "]").onup = function () {
        window.clearInterval(krpano.get("autoMoveIntervalId"));
        movingSpot = {};
        updateHotSpotData();
        canShowLeft = true;
        $("#isEdited").text('保存*');
    };
    krpano.get("hotspot[" + spotName + "]").onclick = null;
    krpano.get("hotspot[" + spotName + "]").onover = function () {
        if (movingSpot == {}) {
            var currentSpot = selectHotSpot();
            $("[name=" + currentSpot.name + "Hover]").addClass("hot-spot-list-hover");
        }
    };
    krpano.get("hotspot[" + spotName + "]").onout = function () {
        $(".hot-spot-list").removeClass("hot-spot-list-hover");
    };
}

function removeHotSpot(name) {
    krpano.call("removehotspot(" + name + ")");
    updateHotSpotData();
    $("#isEdited").text('保存*');
}