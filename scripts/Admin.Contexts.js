/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 컨텍스트 목록 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Contexts.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 2. 13.
 */
var Admin;
(function (Admin) {
    let Contexts;
    (function (Contexts) {
        class Panel extends Admin.Panel {
            type = 'contexts';
            role = 'panel';
            contexts = [];
            sorter;
            /**
             * 컨텍스트 목록을 생성한다.
             *
             * @param {Object} properties - 객체설정
             */
            constructor(properties = null) {
                super(properties);
                this.layout = 'fit';
                this.border = false;
                this.scrollable = 'y';
                this.$setTop();
                this.$scrollable = this.$getContent();
            }
            /**
             * 패널의 상단을 랜더링한다.
             */
            renderTop() {
                const $top = this.$getTop();
                const keyword = new Admin.Form.Field.Text({
                    padding: 0,
                    emptyText: 'Search...',
                });
                keyword.setParent(this);
                $top.append(keyword.$getComponent());
                keyword.render();
                const folder = new Admin.Button({
                    id: this.id + '-folder-add',
                    iconClass: 'xi xi-folder-plus',
                    hidden: true,
                    handler: async () => {
                        const textFolder = (await Admin.getText('admin/contexts/folder'));
                        new Admin.Window({
                            id: this.id + '-folder-add-window',
                            title: textFolder.add,
                            width: 400,
                            items: [
                                new Admin.Form.Panel({
                                    layout: 'fit',
                                    border: false,
                                    padding: 10,
                                    items: [
                                        new Admin.Form.Field.Container({
                                            direction: 'row',
                                            items: [
                                                new Admin.Form.Field.Text({
                                                    width: 80,
                                                }),
                                                new Admin.Form.Field.Text({
                                                    name: 'name',
                                                    flex: true,
                                                    emptyText: Admin.printText('admin/contexts/folder/name'),
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                            ],
                            buttons: [
                                new Admin.Button({
                                    text: '확인',
                                }),
                                new Admin.Button({
                                    text: '취소',
                                    handler: function (button) {
                                        button.getParent().close();
                                    },
                                }),
                            ],
                        }).show();
                    },
                });
                $top.append(folder.$getComponent());
                folder.render();
                const configs = new Admin.Button({
                    id: this.id + '-contexts-configs',
                    iconClass: 'mi mi-config-o',
                    toggle: true,
                    listeners: {
                        toggle: (button, pressed) => {
                            if (pressed == true) {
                                Admin.getComponent(this.id + '-folder-add').show();
                                button.setIconClass('mi mi-check');
                                Html.all('a', this.$getContent()).setAttr('disabled', 'disabled');
                            }
                            else {
                                Admin.getComponent(this.id + '-folder-add').hide();
                                button.setIconClass('mi mi-loading');
                                button.disable();
                                this.saveContexts().then((success) => {
                                    if (success == true) {
                                        button.setIconClass('mi mi-config-o');
                                        button.enable();
                                    }
                                    else {
                                        button.setIconClass('mi mi-config-o');
                                        button.enable();
                                        button.setPressed(true);
                                    }
                                });
                            }
                        },
                    },
                });
                $top.append(configs.$getComponent());
                configs.render();
            }
            /**
             * 컴포넌트 컨텐츠를 랜더링한다.
             */
            renderContent() {
                this.getContexts();
            }
            /**
             * 컨텍스트 목록을 출력한다.
             *
             * @return {Promise<boolean>} success
             */
            async getContexts() {
                const $content = this.$getContent();
                $content.empty();
                const results = await Admin.Ajax.get(Admin.getProcessUrl('module', 'admin', 'contexts'));
                if (results.success == true) {
                    this.contexts = [];
                    for (let context of results.contexts) {
                        context = new Admin.Contexts.Context(context);
                        context.setParent(this);
                        this.contexts.push(context);
                        $content.append(context.$getComponent());
                        context.render();
                    }
                    this.sorter = new Admin.Contexts.Sorter(this);
                    return true;
                }
                else {
                    return false;
                }
            }
            /**
             * 컨텍스트 목록을 저장한다.
             *
             * @return {Promise<boolean>} success
             */
            async saveContexts() {
                const contexts = this.sorter.getContexts();
                const save = await Admin.Ajax.post(Admin.getProcessUrl('module', 'admin', 'contexts'), {
                    contexts: contexts,
                });
                if (save.success == true) {
                    await this.getContexts();
                    return true;
                }
                else {
                    return false;
                }
            }
        }
        Contexts.Panel = Panel;
        class Context extends Admin.Component {
            type = 'contexts';
            role = 'context';
            icon;
            title;
            path;
            target;
            contextType;
            children = [];
            /**
             * 컨텍스트 목록을 생성한다.
             *
             * @param {Object} properties - 객체설정
             */
            constructor(properties = null) {
                super(properties);
                this.icon = this.properties.icon;
                this.title = this.properties.title;
                this.path = this.properties.path ?? '';
                this.target = this.properties.target ?? '_self';
                this.scrollable = false;
                this.children = [];
                for (let child of this.properties.children ?? []) {
                    child = new Admin.Contexts.Context(child);
                    child.setParent(this);
                    this.children.push(child);
                }
                this.contextType = this.properties.type;
                if (this.contextType == 'FOLDER') {
                    this.$setBottom();
                }
            }
            /**
             * 메뉴를 랜더링한다.
             */
            renderContent() {
                const $content = this.$getContent();
                const $context = Html.create('a', { draggable: 'false' });
                $context.on('click', (e) => {
                    const $target = Html.el(e.currentTarget);
                    if ($target.getData('type') == 'folder' || $target.getAttr('disabled') == 'disabled') {
                        e.preventDefault();
                    }
                });
                if (this.contextType == 'CONTEXT') {
                    $context.setAttr('href', Admin.getUrl() + this.path);
                    $context.setAttr('target', this.target);
                }
                else if (this.contextType == 'LINK') {
                    $context.setAttr('href', this.path);
                    $context.setAttr('target', this.target);
                }
                const $icon = Html.create('i', { 'class': 'icon' });
                $icon.addClass(...this.icon.split(' '));
                const $title = Html.create('span', {}, this.title);
                const $button = Html.create('button', { type: 'button', 'data-action': 'sort' });
                $context.append($icon);
                $context.append($title);
                $context.append($button);
                $content.append($context);
            }
            /**
             * 폴더의 경우 하위 메뉴를 랜더링한다.
             */
            renderBottom() {
                if (this.contextType != 'FOLDER')
                    return;
                const $bottom = this.$getBottom();
                for (const child of this.children) {
                    $bottom.append(child.$getComponent());
                    child.render();
                }
            }
            /**
             * 컨텍스트 메뉴를 랜더링한다.
             */
            render() {
                super.render();
                this.$getComponent().setData('context', this.contextType);
                this.$getComponent().setData('properties', this.properties, false);
            }
        }
        Contexts.Context = Context;
        class Sorter {
            panel;
            context = null;
            $context = null;
            $drag = null;
            $drop = null;
            tops = [];
            bottoms = [];
            $contexts = [];
            currentDropIndex = [null, null];
            /**
             * 컨텍스트 목록을 생성한다.
             *
             * @param {Admin.Contexts.Panel} panel
             */
            constructor(panel) {
                this.panel = panel;
                this.setEvent();
            }
            /**
             * 이벤트를 등록한다.
             */
            setEvent() {
                Html.all('button[data-action=sort]', this.panel.$getContent()).forEach(($button) => {
                    new Admin.Drag($button, {
                        pointerType: ['mouse', 'touch', 'pen'],
                        listeners: {
                            start: ($dom) => {
                                /**
                                 * 드래그를 하는동안 마우스를 따라 다닐 객체를 생성한다.
                                 */
                                this.$setDrag($dom.getParents('div[data-component][data-type=contexts]'));
                                /**
                                 * 드래그 시작시 컨텍스트 목록의 좌표를 갱신한다.
                                 */
                                this.updatePositions();
                            },
                            drag: ($dom, tracker) => {
                                if (this.$drag == null) {
                                    this.$setDrag($dom.getParents('div[data-component][data-type=contexts]'));
                                }
                                const { x, y } = tracker.getDelta();
                                const { top, left } = this.$drag.getPosition();
                                this.$drag.setStyle('top', top + y + 'px');
                                this.$drag.setStyle('left', left + x + 'px');
                                /**
                                 * 현재 마우스좌표를 구한다.
                                 */
                                let position = top + y;
                                /**
                                 * 컨텍스트 목록의 DOM 의 위치를 마우스의 Y 좌표에 반영한다.
                                 */
                                position -= this.panel.$getContent().getOffset().top;
                                /**
                                 * 컨텍스트 목록의 스크롤 위치를 마우스의 Y 좌표에 반영한다.
                                 */
                                position += this.panel.getScrollbar().getPosition().y;
                                this.setDropPosition(position);
                            },
                            end: () => {
                                if (this.$drag == null) {
                                    return;
                                }
                                if (this.$drop === null) {
                                    const { top, left } = this.$context.getOffset();
                                    this.$drag.animate({ top: top + 'px', left: left + 'px' }, { duration: 300, easing: 'ease-in-out' }, () => {
                                        this.$drag.remove();
                                        this.$context.removeAttr('data-drag');
                                        this.$drag = null;
                                        this.$drop = null;
                                        this.context = null;
                                        this.$context = null;
                                    });
                                }
                                else {
                                    this.$context.remove();
                                    const { top, left } = this.$drop.getOffset();
                                    this.$drag.animate({ top: top + 'px', left: left + 'px' }, { duration: 300, easing: 'ease-in-out' }, () => {
                                        this.$drag.remove();
                                        this.context.$getComponent().removeAttr('data-drag');
                                        this.$drop.replaceWith(this.context.$getComponent());
                                        this.$drag = null;
                                        this.$drop = null;
                                        this.context = null;
                                        this.$context = null;
                                    });
                                }
                            },
                        },
                    });
                });
            }
            /**
             * 현재 정렬된 트리구조를 가져온다.
             *
             * @return {any[]} contexts
             */
            getContexts() {
                const contexts = [];
                Html.all('> div[data-component][data-type=contexts][data-role=context]', this.panel.$getContent()).forEach(($context) => {
                    const properties = $context.getData('properties');
                    if ($context.getData('context') == 'FOLDER') {
                        const folder = {
                            title: properties.title,
                            icon: properties.icon,
                            smart: properties.smart,
                            children: [],
                        };
                        Html.all('div[data-component][data-type=contexts][data-role=context]', Html.get('div[data-role=bottom]', $context)).forEach(($child) => {
                            const properties = $child.getData('properties');
                            folder.children.push(properties.path);
                        });
                        contexts.push(folder);
                    }
                    else {
                        contexts.push(properties.path);
                    }
                });
                return contexts;
            }
            /**
             * 드래그를 하는 동안 마우스를 따라 다닐 객체를 생성한다.
             *
             * @param {Dom} $target - 드래그되는 컨텍스트 DOM
             * @return {Dom} $drag
             */
            $setDrag($target) {
                if (this.$drag !== null) {
                    this.$drag.remove();
                }
                this.$drag = $target.clone();
                this.$drag.setAttr('data-drag', 'drag');
                this.$drag.setStyle('width', $target.getOuterWidth() + 'px');
                this.$drag.setStyle('top', $target.getOffset().top + 'px');
                this.$drag.setStyle('left', $target.getOffset().left + 'px');
                this.context = Admin.get($target.getData('component'));
                $target.setAttr('data-drag', 'origin');
                this.$context = $target;
                this.panel.$getComponent().append(this.$drag);
                return this.$drag;
            }
            /**
             * 현재 컨텍스트 목록의 좌표를 갱신한다.
             */
            updatePositions() {
                Html.get('div[data-drag=drop]', this.panel.$getContent()).remove();
                this.tops = [];
                this.$contexts = [];
                Html.all('> div[data-component][data-type=contexts][data-role=context]', this.panel.$getContent()).forEach(($context) => {
                    let top = $context.getOffset().top - this.panel.$getContent().getOffset().top;
                    top += this.panel.getScrollbar().getPosition().y;
                    let bottom = top + $context.getOuterHeight();
                    this.tops.push(top);
                    this.bottoms.push(bottom);
                    this.$contexts.push($context);
                    if ($context.getData('context') == 'FOLDER') {
                        const tops = [];
                        const bottoms = [];
                        Html.all('div[data-component][data-type=contexts][data-role=context]', Html.get('div[data-role=bottom]', $context)).forEach(($child) => {
                            let top = $child.getOffset().top - this.panel.$getContent().getOffset().top;
                            top += this.panel.getScrollbar().getPosition().y;
                            let bottom = top + $child.getOuterHeight();
                            tops.push(top);
                            bottoms.push(bottom);
                        });
                        $context.setData('tops', tops, false);
                        $context.setData('bottoms', bottoms, false);
                    }
                });
            }
            /**
             * 이동할 위치를 정의한다.
             *
             * @param {number} y - 이동할 위치의 Y 좌표
             */
            setDropPosition(y) {
                let isLast = true;
                let dropIndex = [0, null];
                this.tops.forEach((top, index) => {
                    if (top >= y) {
                        isLast = false;
                        return false;
                    }
                    dropIndex = [index, null];
                });
                if (isLast == true && this.bottoms[dropIndex[0]] < y) {
                    dropIndex = [dropIndex[0] + 1, null];
                }
                const $next = this.$contexts[dropIndex[0]] ?? null;
                if (this.context.contextType != 'FOLDER' && $next?.getData('context') == 'FOLDER') {
                    isLast = true;
                    dropIndex[1] = null;
                    const tops = $next.getData('tops');
                    const bottoms = $next.getData('bottoms');
                    tops.forEach((top, index) => {
                        if (top >= y) {
                            isLast = false;
                            return false;
                        }
                        dropIndex[1] = index;
                    });
                    if (isLast == true && bottoms[dropIndex[1]] < y) {
                        dropIndex[1] = dropIndex[1] + 1;
                    }
                }
                if (this.currentDropIndex[0] === dropIndex[0] && this.currentDropIndex[1] === dropIndex[1]) {
                    return;
                }
                this.currentDropIndex = dropIndex;
                if (dropIndex[1] === null) {
                    const $prev = this.$contexts[dropIndex[0] - 1] ?? null;
                    const $next = this.$contexts[dropIndex[0]] ?? null;
                    if ($prev?.getAttr('data-drag') == 'origin') {
                        $prev.addClass('drop');
                        Html.get('div[data-drag=drop]', this.panel.$getContent()).remove();
                        this.$drop = null;
                        return;
                    }
                    if ($next?.getAttr('data-drag') == 'origin') {
                        $next.addClass('drop');
                        Html.get('div[data-drag=drop]', this.panel.$getContent()).remove();
                        this.$drop = null;
                        return;
                    }
                }
                Html.get('div[data-drag=origin]', this.panel.$getContent()).removeClass('drop');
                Html.get('div[data-drag=drop]', this.panel.$getContent()).remove();
                this.$drop = this.$context.clone();
                this.$drop.setAttr('data-drag', 'drop');
                if (dropIndex[1] == null) {
                    this.panel.$getContent().append(this.$drop, dropIndex[0]);
                }
                else {
                    Html.get('div[data-role=bottom]', this.$contexts[dropIndex[0]]).append(this.$drop, dropIndex[1]);
                }
            }
        }
        Contexts.Sorter = Sorter;
    })(Contexts = Admin.Contexts || (Admin.Contexts = {}));
})(Admin || (Admin = {}));