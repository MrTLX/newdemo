/* 描述：窗口打开事件
 * 日期：2017-4-21
 * 创建：涂理翔 
 */
(function ($) {
    //打开窗体
    OpenWindow = function (param) {
        param.Width = ktw.IsNull(param.Width) || param.Width === "0" ? $(window).width() : param.Width;
        param.Height = ktw.IsNull(param.Height) || param.Height === "0" ? $(window).height() : param.Height;
        var position = GetPosition({ X: param.Left, Y: param.Top }, { Width: param.Width, Height: param.Height }, param.PPosition);
        var win = new $.MDIWindow({
            ID: param.ID,
            Title: param.Title,
            Width: param.Width,
            Height: param.Height,
            Left: position.X,
            Top: position.Y,
            IconUri: param.Icon,
            Url: param.Url,
            Content: param.Content,
            Modal: param.Modal,
            IconUri: param.IconUri,
            Closable: param.Closable,
            Maximizable: param.Maximizable,
            Collapsible: param.Collapsible,
            Resizable: param.Resizable,
            Draggable: param.Draggable,
            Tools: param.Tools,
            Visible: param.Visible,
            Parent: param.Parent,
            IsDestroy: param.IsDestroy
        });
        return win;
    };
    /*功能：获取窗体展示的位置*/
    GetPosition = function (position, size, parentPos) {
        var winWidth = $(window).width();
        var winHeight = $(window).height();
        var left = ktw.IsNull(parentPos) ? 0 : parentPos.Left;
        var top = ktw.IsNull(parentPos) ? 0 : parentPos.Top;
        switch (position.X.toString().toUpperCase()) {
            case PositionEnum.Left: left = left + 0; break;
            case PositionEnum.Right: left = winWidth - size.Width; break;
            case PositionEnum.Center: left = (winWidth - size.Width + left) / 2; break;
            default:
                if (size.Width === winWidth) left = 0;
                else {
                    left = left + parseFloat(position.X);
                    if (left > winWidth) {
                        left = left - parseFloat(position.X);
                        if ((left + size.Width) > winWidth || size.Width > winWidth) left = 0;
                    }
                }
                break;
        }
        switch (position.Y.toString().toUpperCase()) {
            case PositionEnum.Top: top = top + 0; break;
            case PositionEnum.Bottom: top = winHeight - size.Height; break;
            case PositionEnum.Center: top = (winHeight - size.Height + top) / 2; break;
            default:
                if (size.Width === winWidth) top = 0;
                else {
                    top = top + parseFloat(position.Y);
                    if (top > winHeight) {
                        top = top - parseFloat(position.Y);
                        if ((top + size.Height) > winHeight || size.Height > winHeight) top = 0;
                    }
                }
                break;
        }
        return { X: left, Y: top };
    };
    /*功能:位置枚举*/
    PositionEnum = { Left: 'LEFT', Right: 'RIGHT', Center: 'CENTER', Top: 'TOP', Bottom: 'BOTTOM' };

})(jquery);