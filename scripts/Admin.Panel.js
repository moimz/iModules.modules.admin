/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 패널 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Panel.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2022. 12. 1.
 */
var Admin;
(function (Admin) {
    class Panel extends Admin.Component {
        type = 'panel';
        role = 'panel';
        border;
        margin;
        scrollable;
        title;
        topbar;
        bottombar;
        $container;
        $top;
        $bottom;
        $content;
        /**
         * 패널을 생성한다.
         *
         * @param {Object} properties - 객체설정
         */
        constructor(properties = null) {
            super(properties);
            this.layout = this.properties.layout ?? 'auto';
            this.border = this.properties.border ?? true;
            this.margin = this.properties.margin ?? null;
            this.scrollable = this.properties.scrollable ?? false;
            if (this.properties.title || this.properties.iconClass) {
                if (this.properties.title instanceof Admin.Title) {
                    this.title = this.properties.title;
                }
                else {
                    this.title = new Admin.Title(this.properties.title ?? '');
                }
                if (this.properties.iconClass) {
                    this.title.setIconClass(this.properties.iconClass);
                }
                this.title.setParent(this);
            }
            else {
                this.title = null;
            }
            if (this.properties.topbar) {
                if (this.properties.topbar instanceof Admin.Toolbar) {
                    this.topbar = this.properties.topbar;
                }
                else {
                    this.topbar = new Admin.Toolbar(this.properties.topbar);
                }
            }
            else {
                this.topbar = null;
            }
            this.topbar?.setPosition('top');
            if (this.properties.bottombar) {
                if (this.properties.topbar instanceof Admin.Toolbar) {
                    this.bottombar = new Admin.Toolbar(this.properties.bottombar);
                }
                else {
                    this.bottombar = new Admin.Toolbar(this.properties.bottombar);
                }
            }
            else {
                this.bottombar = null;
            }
            this.bottombar?.setPosition('bottom');
            this.$container = Html.create('div').setData('role', 'container');
            this.$top = Html.create('div').setData('role', 'top');
            this.$bottom = Html.create('div').setData('role', 'bottom');
            this.$content = Html.create('div').setData('role', 'body');
        }
        /**
         * 탭패널의 하위 컴포넌트를 정의한다.
         */
        initItems() {
            if (this.items === null) {
                this.items = [];
                if (this.properties.html) {
                    this.items.push(new Admin.Text(this.properties.html));
                }
                for (let item of this.properties.items ?? []) {
                    if (item instanceof Admin.Component) {
                        this.items.push(item);
                    }
                }
            }
        }
        /**
         * 패널의 컨테이너 DOM 을 가져온다.
         *
         * @return {Dom} $container
         */
        $getContainer() {
            return this.$container;
        }
        /**
         * 패널의 상단 DOM 을 가져온다.
         *
         * @return {Dom} $top
         */
        $getTop() {
            return this.$top;
        }
        /**
         * 패널의 하단 DOM 을 가져온다.
         *
         * @return {Dom} $bottom
         */
        $getBottom() {
            return this.$bottom;
        }
        /**
         * 패널의 본문 DOM 을 가져온다.
         *
         * @return {Dom} $content
         */
        $getContent() {
            return this.$content;
        }
        /**
         * 패널의 툴바를 가져온다.
         *
         * @param {string} position - 가져올 툴바 위치 (top, bottom)
         * @return {Admin.Toolbar} toolbar
         */
        getToolbar(position) {
            if (position == 'top') {
                return this.topbar;
            }
            else if (position == 'bottom') {
                return this.bottombar;
            }
        }
        /**
         * 패널의 상단을 랜더링한다.
         */
        renderTop() {
            if (this.$top.getData('rendered') == true)
                return;
            if (this.title !== null) {
                this.$top.append(this.title.$getComponent());
                this.title.render();
            }
            if (this.topbar !== null) {
                this.$top.append(this.topbar.$getComponent());
                this.topbar.render();
            }
            this.$top.setData('rendered', true);
        }
        /**
         * 패널의 하단 레이아웃을 랜더링한다.
         */
        renderBottom() {
            if (this.$bottom.getData('rendered') == true)
                return;
            if (this.bottombar !== null) {
                this.$bottom.append(this.bottombar.$getComponent());
                this.bottombar.render();
            }
            this.$bottom.setData('rendered', true);
        }
        /**
         * 패널의 본문 레이아웃을 랜더링한다.
         */
        renderContent() {
            if (this.$content.getData('rendered') == true)
                return;
            for (const item of this.getItems()) {
                this.$content.append(item.$getComponent());
                item.render();
            }
            this.$content.setData('rendered', true);
        }
        /**
         * 레이아웃을 렌더링한다.
         */
        render() {
            if (this.isRenderable() == false)
                return;
            if (this.border == true) {
                this.$container.addClass('border');
            }
            if (this.margin !== null) {
                if (typeof this.margin == 'number') {
                    this.margin = this.margin + 'px';
                }
                this.$component.setStyle('padding', this.margin);
            }
            if (this.scrollable == true) {
                this.$content.addClass('scrollableX');
                this.$content.addClass('scrollableY');
            }
            else if (this.scrollable == 'X') {
                this.$content.addClass('scrollableX');
            }
            else if (this.scrollable == 'Y') {
                this.$content.addClass('scrollableY');
            }
            this.renderTop();
            this.renderBottom();
            this.renderContent();
            this.$container.append(this.$top);
            this.$container.append(this.$content);
            this.$container.append(this.$bottom);
            this.append(this.$container);
            super.render();
        }
    }
    Admin.Panel = Panel;
})(Admin || (Admin = {}));
