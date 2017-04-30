(function () {
    //设置初始宽度
    function resolve(data) {
        var datas = {};
        var name = data.orgname;
        var clouddisk = data.clouddisk;
        var usecloud = data.usedclouddisk;
        var useclouddisk = usecloud;
        //1G == 5px;
        var useWidth = useclouddisk * 5 + "px";
        var recoveryWidth = (clouddisk - useclouddisk) * 5 + "px";
        datas = { orgname: name, useWidth: useWidth, recoveryWidth: recoveryWidth, useclouddisk: useclouddisk, clouddisk: clouddisk };
        return datas

    }
    //创建滑块模板
    function establish(sliderDom, NnumberspinnerDom, param) {
        //创建滑块
        sliderDom.slider({
            showTip: true,
            reversed: true,
            min: 0,
            max: param.clouddisk - param.usedclouddisk,
            min: 0,
            mode: 'h',
            step: 1,
            tipFormatter: function (value) {
                return ((param.clouddisk - value));
            },
          
            onChange: function (newValue, oldValue) {
            var datas = { newValue: newValue, oldValue: oldValue };
                //圆饼图变化事件
                sliderDom.trigger('Recoveryclick', datas);
                //数字微调变化事件
                NnumberspinnerDom.numberspinner("setValue", newValue);
            },
        });
        //创建数字微调
        NnumberspinnerDom.numberspinner({
            min: 0,
            max: (param.clouddisk - param.usedclouddisk),         
            value: 0,
            suffix: "GB",
            editable: false,
            onSpinUp: function () {
                    var v = NnumberspinnerDom.numberspinner("getValue");
                    sliderDom.slider("setValue", v);
            },
            onSpinDown: function () {
                var v = NnumberspinnerDom.numberspinner("getValue");
                sliderDom.slider("setValue", v);
            }
        });
    }
    Recovery = function (param) {
       if (param == null || param.Parent == null) return;
        this.Parent = param.Parent;
        this.SliderData = [];//存放循环后控件生成的所有dom及参数        
        for (var i = 0; i < param.length; i++) {
            if (param[i].clouddisk == 0) {
                continue;
            }
            //设置初始宽度
            var option = resolve(param[i]);
            //存放循环一次得到相关属性
            var datas = {
                data: { orgname: param[i].orgname, relation: 0, clouddisk: param[i].clouddisk,useclouddisk:option.useclouddisk },
            };

            var usenum = $('<div style="height:25px;width:25px; color: #CCCCCC;float:left;"><div style="padding-top:11px;font-size:10px;text-align:center;">' + option.useclouddisk + '</div></div>');
            var recoverynum = $('<div style="height:25px;width:25px; color: #CCCCCC;"><div style="padding-top:11px;font-size:10px;text-align:center;">' + option.clouddisk + '</div></div>');

            this.Target = $('<div style="height:25px;margin-bottom:10px;"></div>');
            var name = $('<div style="float:left;height:22px;line-height:22px;"></div>');
            var nametarget = $('<div id="name" style="text-align: right;float: right;width:100%;font-size:11px;font-weight:bold;color：#000000;font-family: "Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif;">' + option.orgname + '：</div>');
            name.append(nametarget);
            this.Target.append(name);

            var slidertarget = $('<div style="float:left;"></div>');
            var usedom = $('<div style="height: 22px; width:' + option.useWidth + '; background-color: red; float: left;"></div>');
            var sliderdom = $('<div style="float: left;width:' + option.recoveryWidth + ';"></div>');
            this.Slider = $('<div></div>');
            sliderdom.append(this.Slider);
            slidertarget.append(usedom);
            slidertarget.append(sliderdom);

            var numberspinnerdom = $('<div style="float:left;margin-left:60px;"><div style=""><input id="ss" required="required" style="width:75px;height:22px;"/></div></div>');
            this.Target.append(slidertarget);
            this.Target.append(numberspinnerdom);

            this.Parent.append(usenum);
            this.Parent.append(recoverynum);
            this.Parent.append(this.Target);

            datas.slidertarget = slidertarget;
            datas.namedom = nametarget;
            datas.recoverydom = sliderdom;
            datas.sliderdom = this.Slider;
            datas.usedom = usedom;
            datas.recoverynum = recoverynum;
            datas.usenum = usenum;
            this.SliderData.push(datas);
            //创建滑动模块
            establish(this.Slider, numberspinnerdom.find("#ss"), param[i]);
        }
    }
    $.fn.extend(Recovery.prototype, {
        Resize: function () {
            $this = this;
            var a = $this.Parent.width();
            var width = $this.Parent.width() - 226-60;//固定滑块的宽度

            //设置name所在div的宽
            //最宽的名称
            var maxNamewidth = $this.SliderData[0].namedom.width();
                for (var i = 0; i < $this.SliderData.length; i++) {
                    if ($this.SliderData[i].namedom.width() > maxNamewidth) {
                        maxNamewidth = $this.SliderData[i].namedom.width();
                    }
                }
                if (maxNamewidth > 120) {
                    maxNamewidth = 120;
                } else {
                    maxNamewidth = maxNamewidth;
                }

            for (var i = 0; i < $this.SliderData.length; i++) {
                $this.SliderData[i].namedom.css("width", maxNamewidth + 8);
            }

            var a = maxNamewidth;
            //如果滑块的宽大于给定的宽，重新设置已使用和可回收的宽  
            //最宽的滑块
            var maxWidth = $this.SliderData[0].recoverydom.width() + $this.SliderData[0].usedom.width();
            var useWidth = (width / maxWidth) * $this.SliderData[0].usedom.width();
            var recoveryWidth = (width / maxWidth) * $this.SliderData[0].recoverydom.width();
            pie = (useWidth + recoveryWidth) / $this.SliderData[0].data.clouddisk;
            sliderTargetwidth = useWidth + recoveryWidth;
            for (var i = 0; i < $this.SliderData.length; i++) {
                //循环得到最宽的,得到px/GB
                if ($this.SliderData[i].recoverydom.width() + $this.SliderData[i].usedom.width() > maxWidth) {
                    maxWidth = $this.SliderData[i].recoverydom.width() + $this.SliderData[i].usedom.width();
                    //实际页面中显示的最长宽度
                    useWidth = (width / maxWidth) * $this.SliderData[i].usedom.width();
                    recoveryWidth = (width / maxWidth) * $this.SliderData[i].recoverydom.width();
                    pie = (useWidth + recoveryWidth) / $this.SliderData[i].data.clouddisk;
                    sliderTargetwidth = useWidth + recoveryWidth;
                } 
            }
            for (var i = 0; i < $this.SliderData.length; i++) {
                var a = pie;
                $this.SliderData[i].slidertarget.css("width", sliderTargetwidth);
                $this.SliderData[i].usedom.css("width", pie * $this.SliderData[i].data.useclouddisk);
                $this.SliderData[i].recoverydom.css("width", pie * ($this.SliderData[i].data.clouddisk - $this.SliderData[i].data.useclouddisk));
                $this.SliderData[i].sliderdom.slider("reset");
            }

            //得到usenum和recoverynum的位置
            for (var i = 0; i < $this.SliderData.length; i++) {
                var useWidth = $this.SliderData[i].usedom.width();
                var recoveryWidth = $this.SliderData[i].recoverydom.width();
                $this.SliderData[i].usenum.css("margin-left", maxNamewidth + useWidth - 5);
                $this.SliderData[i].recoverynum.css("margin-left", maxNamewidth + useWidth + recoveryWidth - 5);
            }
            

        }
    })
})(jQuery);