/* 描述：封装jetty服务监控
 * 日期：2016-11-21
 * 创建：涂理翔 
 */
(function ($) {
    //获取每条端口的具体信息  start
    function resolve(portParam) {
        var jettyparam = {
            port: portParam.port,
            type: "",
            cpuWidth: "0px",
            cpuColor: "#FF3220",
            cpuPercentage: "X",
            memoryPercentage: "X",
            memoryWidth: "0px",
            memoryColor: "#FF3220"
        };
        //获取每条端口的具体信息  end

        switch (parseInt(portParam.type)) {
            case 0: jettyparam.type = "主"; break;
            case 1: jettyparam.type = "计"; break;
            case 2: jettyparam.type = "负"; break;
            default: jettyparam.type = "合"; break;
        }
        // 未开启监控
        if (portParam.order == 0) return jettyparam;

        jettyparam.cpuPercentage = portParam.cpuRatio + "%";
        jettyparam.cpuWidth = 0.9 * portParam.cpuRatio + "px";
        //cpu中的颜色字体设置，并记录对应不同颜色的个数           
        if (portParam.cpuRatio >= 0 && portParam.cpuRatio <= 50) {
            jettyparam.cpuColor = '#72C302';
        } else if (portParam.cpuRatio > 50 && portParam.cpuRatio <= 80) {
            jettyparam.cpuColor = '#FA6F14';
        } else {
            jettyparam.cpuColor = '#FF3220';
        }
        jettyparam.memoryPercentage = portParam.memoryRatio + "%";
        jettyparam.memoryWidth = 0.9 * portParam.memoryRatio + "px";
        //内存中的颜色字体设置
        if (portParam.memoryRatio >= 0 && portParam.memoryRatio <= 50) {
            jettyparam.memoryColor = '#72C302';
        } else if (portParam.memoryRatio > 50 && portParam.memoryRatio <= 80) {
            jettyparam.memoryColor = '#FA6F14';
        } else {
            jettyparam.memoryColor = '#FF3220';
        }
        return jettyparam;
    }
    JettyMonitor = function (param) {
        if (param == null || param.ip == null || param.Parent == null) return;
        this.IP = param.ip;
        this.Ports = param.jettyportlist;
        this.Parent = param.Parent;
        this.Jettys = [];
        //动态生成存放每条ip和端口的div容器  start
        this.Target = $('<div style="margin-bottom:10px; min-width:945px;"></div>');
        var header = $('<div class="ip"></div>');
        this.HeaderImage = $('<img src="../image/jettyimg/service.png" />');
        header.append(this.HeaderImage);
        header.append($('<div style="font-family: Microsoft YaHei; font-size: 12px; color: #3FA1E0;">'
                + this.IP + '</div>'));
        this.Content = $('<div class="jettyList" style="min-width: 800px;"></div>');
        this.Target.append(header);
        this.Target.append(this.Content);
        //动态生成存放每条ip(dom已生成)和端口的div容器（只有最外面的大容器）  end

        //开始遍历端口
        for (var i = 0; i < this.Ports.length; i++) {
            var jettydom = {
                IP: param.ip,
                Port: this.Ports[i].port,
                Target: null,
                TitleDom: null,
                CPUDom: null,
                MemoryDom: null,
                //IsChecked: true
                IsChecked: false

            };
            //得到相关参数`
            var jettyPort = resolve(this.Ports[i]);
            //一个jetty
            jettydom.Target = $('<div style="width: 200px;height: 100px;float: left;border-left: 0px;"></div>');
            //jetty中的头
            jettydom.TitleDom = $('<div class="head">' + jettyPort.port + "【" + jettyPort.type + "】" + '</div>');
            jettydom.Target.append(jettydom.TitleDom);
            //jetty中的cpu
            jettydom.CPUDom = $('<div class="cpu">'
                        + '<div class="cpuImg"></div><span style="float:left">CPU</span>'
                        + '<div class="ration">'
                        + '<div class="cpuWidth" style="width:0px;height:100%;"></div>'
                        + '</div>'
                        + '<span class="cPercentage" style="float:left;color:#FF3220;">' + "X" + '</span>'
                        //+ '<span class="cPkercentage" style="float:left;color:#FF3220;">' + this.Ports[i].cpuRatio + "%" + '</span>'
                        + '</div>');
            //jetty中的内存
            jettydom.MemoryDom = $('<div class="memory">'
                        + ' <div class="memoryImg"></div><span style="float:left">内存</span> '
                        + '<div class="ration">'
                        + '   <div class="memoryWidth" style="height: 100%; width: 0px;"></div>'
                        + '</div>'
                        + '<span class="mPercentage" style="float:left;color:#FF3220;">' + "X" + '</span>'
                        //+ '<span class="mPercentage" style="float:left;color:#FF3220;">' + this.Ports[i].memoryRatio + "%" + '</span>'
                        + '</div>');
            //鼠标移动到jetty时要出现边框
            var hoverdom = $('<div class="movenStyle" ></div>');
            jettydom.CheckDom = $('<div class="choice"  style="background-repeat: no-repeat;background-position: -96px 0px;height: 16px;width: 16px;margin-left: 178px;margin-top: 3px;float: left;cursor: pointer;"></div>');
            hoverdom.append(jettydom.CheckDom);
            // 追加元素
            jettydom.Target.append(jettydom.CPUDom);
            jettydom.Target.append(jettydom.MemoryDom);
            jettydom.Target.append(hoverdom);
            //鼠标移动到一个jetty上时，触发的事件
            jettydom.Target.bind("mouseover", jettydom, function (e) {
                if (!e.data.IsChecked) {
                    $(e.currentTarget).find(".movenStyle").css("display", "block");
                }
            });
            jettydom.Target.bind("mouseout", jettydom, function (e) {
                if (!e.data.IsChecked) {
                    $(e.currentTarget).find(".movenStyle").css("display", "none");
                }
            });
            //图片点击事件 
            jettydom.CheckDom.bind("click", jettydom, function (e) {
                if (e.currentTarget.style.background == "") return; //去除服务未开启的点击事件（服务未开启时background为""）
                var data = e.data;
                var backgroundPosition = data.CheckDom.css("background-position");
                // 选中
                if (!data.IsChecked) {
                    data.CheckDom.css("background-position", "-112px 0px");
                    data.CheckDom.find(".movenStyle").css("display", "block");
                    data.IsChecked = true;
                } else {
                    // 未选中
                    data.CheckDom.css("background-position", "-96px 0px");
                    data.CheckDom.find(".movenStyle").css("display", "none");
                    data.IsChecked = false;
                }
            });
            this.Content.append(jettydom.Target);
            this.Header = header;
            this.Jettys.push(jettydom);
        }
        this.Parent.append(this.Target);
        //给每一个header绑定点击事件并获取所有jetty信息
        header.bind("click", this.Target, function (e) {
            var datas = { data: [] };

            for (var i = 0; i < param.jettyportlist.length; i++) {
                datas.data.push(param.ip + ":" + param.jettyportlist[i].port);
            }
            e.data.trigger('Click', datas);//自动执行点击事件
        });
        //$.extend(JettyMonitor.prototype, this.Target);
    };
    $.fn.extend(JettyMonitor.prototype, {
        Resize: function () {
            $this = this;
            var width = $this.Parent.width() - 147;//得到一个节点下所有port所在容器的宽度
            if (width > 945) {//判断是否大于其最小宽度
                var jettynum = parseInt(width / 200);//每行jetty的个数
            } else {
                var jettynum = parseInt(945 / 200); //每行jetty的个数
            }
            var linage = Math.ceil($this.Ports.length / jettynum); //jetty的行数
            $this.Target.css("height", 100 * linage);
            $this.Header.css("height", 100 * linage - 2);
            $this.HeaderImage.css("margin-top", (98 * linage - 1 - 78) / 2);
        },
        SetValue: function (params) {
            var $this = this;
            for (var i = 0; i < params.length; i++) {
                for (var j = 0; j < $this.Jettys.length; j++) {
                    if (params[i].port == $this.Jettys[j].Port) {
                        // 未启动监控
                        var flag = params[i].order == 0;
                        if (!flag && $this.Jettys[j].CheckDom[0].style.background == "") {
                            $this.Jettys[j].CheckDom.css("background", 'url("../../image/jettyimg/bigImg-icon.png") no-repeat -96px 0px');

                        }
                        var p = resolve(params[i]);
                        $this.Jettys[j].CPUDom.find(".cpuWidth").css("width", p.cpuWidth);
                        $this.Jettys[j].CPUDom.find(".cpuWidth").css("background-color", p.cpuColor);
                        $this.Jettys[j].CPUDom.find(".cPercentage").css("color", p.cpuColor)
                        $this.Jettys[j].CPUDom.find(".cPercentage").html(p.cpuPercentage);
                        $this.Jettys[j].MemoryDom.find(".memoryWidth").css("width", p.memoryWidth);
                        $this.Jettys[j].MemoryDom.find(".memoryWidth").css("background-color", p.memoryColor);
                        $this.Jettys[j].MemoryDom.find(".mPercentage").css("color", p.memoryColor)
                        $this.Jettys[j].MemoryDom.find(".mPercentage").html(p.memoryPercentage);
                    } else {
                        continue;
                    }
                }
            }
        },
        GetSelected: function () {
            var $this = this;
            var list = [];
            for (var i = 0; i < $this.Jettys.length; i++) {
                if ($this.Jettys[i].IsChecked) {
                    list.push($this.IP + ":" + $this.Jettys[i].Port);
                }
            }
            return list;
        },
    });
})(jQuery);
/* 描述：封装jetty服务监控
 * 日期：2016-11-28
 * 创建：涂理翔 
 */
(function ($) {
    //获取需要的数据
    function resolve(data) {
        var cpuSum = 0; //cpu使用量总和
        var memorySum = 0; //内存使用量总和
        var jettyparam = {
            jettysNum: data.length,
            cpuState: { cpuSum: 0, cnormals: [], cgenerals: [], cseriouss: [] },//cnormals 正常的    cgenerals 一般的  cseriouss严重的
            memoryState: { memorySum: 0, mnormals: [], mgenerals: [], mseriouss: [] }
        };
        for (var i = 0; i < data.length; i++) {
            //判断jetty服务的开启状态
            //if (data[i].order == 0) {
            cpuSum += data[i].cpuRatio;
            //cpuSum = cpuSum + data[i].cpuRatio;
            jettyparam.cpuState.cpuSum = cpuSum.toFixed(1);
            memorySum = (memorySum + data[i].memoryRatio);
            jettyparam.memoryState.memorySum = memorySum.toFixed(1);
            //cpuRatio 状态判定   
            if (data[i].cpuRatio >= 0 && data[i].cpuRatio <= 50) {
                var cnPort = data[i].port;
                jettyparam.cpuState.cnormals.push(cnPort);//得到端口号
            } else if (data[i].cpuRatio > 50 && data[i].cpuRatio <= 80) {
                var cgPort = data[i].port;
                jettyparam.cpuState.cgenerals.push(cgPort);
            } else {
                var csPort = data[i].port;
                jettyparam.cpuState.cseriouss.push(csPort);
            }
            //memoryRatio 状态判定

            if (data[i].memoryRatio >= 0 && data[i].memoryRatio <= 50) {
                var mnPort = data[i].port;
                jettyparam.memoryState.mnormals.push(mnPort);//得到端口号
            } else if (data[i].memoryRatio > 50 && data[i].memoryRatio <= 80) {
                var mgPort = data[i].port;
                jettyparam.memoryState.mgenerals.push(mgPort);
            } else {
                var msPort = data[i].port;
                jettyparam.memoryState.mseriouss.push(msPort);
            }
            //}
        };
        stateData = jettyparam;
        return jettyparam;
    };

    JettyTotal = function (param) {
        if (param==null || param.ip==null || param.Parent==null) return;
        this.IP = param.ip;
        this.Parent = param.Parent;
        var jettydom = {
            IP: param.ip,
            Port: param.jettyportlist
        };//供内部使用（点击事件）

        //获取页面需要的参数
        var options = resolve(param.jettyportlist);

        this.Target = $(' <div class="jettyNum"></div>');

        var head = $('<div class="Thead">'
            + '<img style="margin-top: 10px; float: left; margin-left: 40px;" src="../image/jettyimg/whiteservice.png" />'
            + '</div>');
        var ip = $('<div style="width: 150px; float: left; margin-top: 10px; color: #FFFFFF;">IP：</div>');
        var serviceIP = $('<a class="toclick" style="cursor:pointer">【' + param.ip + '】</a>');
        this.JettysNum = $('<div class="jettysnum" style="float: left; width:150px; color: #FFFFFF; margin-top: 8px;">jetty总数：' + options.jettysNum + '</div>');
        ip.append(serviceIP);
        head.append(ip);
        head.append(this.JettysNum);
        this.Target.append(head);

        this.CPUDom = $('<div class="Tcpu"><div class="TcpuImg"></div>'
            + '<span style="float: left">CPU：</span><span class="cpuPercentage" style="float: left; color: #FA6F14;width:28px;">' + options.cpuState.cpuSum + '%</span>'
            + '</div>');
        var cpuSeriousDom = $('<div style="cursor:pointer"><div class="serious" style="margin-left: 20px;"></div><div class="seriousnum" style="float: left;">' + options.cpuState.cseriouss.length + '</div></div>');
        var cpuGeneralDom = $('<div style="cursor:pointer"><div class="general"></div><div class="generalnum" style="float: left;">' + options.cpuState.cgenerals.length + '</div></div>');
        var cpuNormalDom = $('<div style="cursor:pointer"><div class="normal"></div><div class="normalnum" style="float: left;">' + options.cpuState.cnormals.length + '</div></div>');
        this.CPUDom.append(cpuSeriousDom);
        this.CPUDom.append(cpuGeneralDom);
        this.CPUDom.append(cpuNormalDom);
        this.Target.append(this.CPUDom);

        this.MemoryDom = $('<div class="Tmemory"><div class="TmemoryImg"></div>'
            + '<span style="float: left">内存：</span><span class="memoryPercentage" style="float: left; color: #FA6F14;width:28px;">' + options.memoryState.memorySum / options.jettysNum + '%</span>'
            + '</div>');
        var memorySeriousDom = $('<div style="cursor:pointer"><div class="serious" style="margin-left: 20px;"></div><div class="seriousnum" style="float: left;">' + options.memoryState.mseriouss.length + '</div></div>');
        var memoryGeneralDom = $('<div style="cursor:pointer"><div class="general"></div><div class="generalnum" style="float: left;">' + options.memoryState.mgenerals.length + '</div></div>');
        var memoryNormalDom = $('<div style="cursor:pointer"><div class="normal"></div><div class="normalnum" style="float: left">' + options.memoryState.mnormals.length + '</div></div>');
        this.MemoryDom.append(memorySeriousDom);
        this.MemoryDom.append(memoryGeneralDom);
        this.MemoryDom.append(memoryNormalDom);
        this.Target.append(this.MemoryDom);
        this.Parent.append(this.Target);
        //刷新所需容器
        this.CPUSeriousDom = cpuSeriousDom;
        this.CPUGeneralDom = cpuGeneralDom;
        this.CPUNormalDom = cpuNormalDom;
        this.MemorySeriousDom = memorySeriousDom;
        this.MemoryGeneralDom = memoryGeneralDom;
        this.MemoryNormalDom = memoryNormalDom;
        //页面点击事件
        //鼠标点击和移动到ip所在区域时触发的事件
        serviceIP.bind("mouseover", function (e) {
            serviceIP.css("color", "#45b6fc");
        });
        serviceIP.bind("mouseout", function (e) {
            serviceIP.css("color", "");;
        });
        serviceIP.bind("click", this.Target, function (e) {//缩略图部分的IP+port点击事件
            var data = [];
            for (var i = 0; i < param.jettyportlist.length; i++) {
                data.push(param.ip + ":" + param.jettyportlist[i].port);
            }
            var datas = { data: data };
            e.data.trigger('Stateclick', datas);
        });
        //cpu不同状态的点击触发事件
        cpuSeriousDom.bind("click", this.Target, function (e) {
            var data = [];
            var port = options.cpuState.cseriouss;
            for (var i = 0; i < port.length; i++) {
                data.push(param.ip + ":" + port[i]);
            }
            var datas = { data: data };
            e.data.trigger('Stateclick', datas);
        });
        cpuGeneralDom.bind("click", this.Target, function (e) {
            var data = [];
            var port = options.cpuState.cgenerals;
            for (var i = 0; i < port.length; i++) {
                data.push(param.ip + ":" + port[i]);
            }
            var datas = { data: data };
            e.data.trigger('Stateclick', datas);
        });
        cpuNormalDom.bind("click", this.Target, function (e) {
            var data = [];
            var port = options.cpuState.cnormals;
            for (var i = 0; i < port.length; i++) {
                data.push(param.ip + ":" + port[i]);
            }
            var datas = { data: data };
            e.data.trigger('Stateclick', datas);
        });
        //修改部分  start
        //cpuNormalDom.bind("click", this.Target, function (e) {
        //    var data = [];
        //    var port = stateData.cpuState.cnormals;
        //    for (var i = 0; i < port.length; i++) {
        //        data.push(param.ip + ":" + port[i]);
        //    }
        //    var datas = { data: data };
        //    e.data.trigger('Stateclick', datas);
        //});
        //修改部分  end 

        //内存中不同状态点击触发事件
        memorySeriousDom.bind("click", this.Target, function (e) {
            var data = [];
            var port = options.memoryState.mseriouss;
            for (var i = 0; i < port.length; i++) {
                data.push(param.ip + ":" + port[i]);
            }
            var datas = { data: data };
            e.data.trigger('Stateclick', datas);
        });
        memoryGeneralDom.bind("click", this.Target, function (e) {
            var data = [];
            var port = options.memoryState.mgenerals;
            for (var i = 0; i < port.length; i++) {
                data.push(param.ip + ":" + port[i]);
            }
            var datas = { data: data };
            e.data.trigger('Stateclick', datas);
        });
        memoryNormalDom.bind("click", this.Target, function (e) {
            var data = [];
            var port = options.memoryState.mnormals;
            for (var i = 0; i < port.length; i++) {
                data.push(param.ip + ":" + port[i]);
            }
            var datas = { data: data };
            e.data.trigger('Stateclick', datas);
        });

        $.extend(JettyTotal.prototype, this.Target);
    };
    $.fn.extend(JettyTotal.prototype, {
        SetValue: function (params) {
            var $this = this
            var data = resolve(params.jettyportlist);
            this.JettysNum.find(".jettysnum").html(data.jettysNum);
            this.CPUDom.find(".cpuPercentage").html(data.cpuState.cpuSum + "%");
            this.CPUSeriousDom.find(".seriousnum").html(data.cpuState.cseriouss.length);
            this.CPUGeneralDom.find(".generalnum").html(data.cpuState.cgenerals.length);
            this.CPUNormalDom.find(".normalnum").html(data.cpuState.cnormals.length);
            this.MemoryDom.find(".memoryPercentage").html(data.memoryState.memorySum + "%");
            //this.MemoryDom.find(".memoryPercentage").html(data.memoryState.memorySum / (data.memoryState.mseriouss.length + data.memoryState.mgenerals.length + data.memoryState.mnormals.length) + "%");
            this.MemorySeriousDom.find(".seriousnum").html(data.memoryState.mseriouss.length);
            this.MemoryGeneralDom.find(".generalnum").html(data.memoryState.mgenerals.length);
            this.MemoryNormalDom.find(".normalnum").html(data.memoryState.mnormals.length);
        },
    });
})(jQuery);