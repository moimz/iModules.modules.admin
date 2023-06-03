/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 모달 윈도우 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Window.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 6. 3.
 */
namespace Admin {
    export namespace Window {
        export interface Listeners extends Admin.Component.Listeners {
            /**
             * @var {Function} show - 윈도우가 보여질 떄
             */
            show?: (window: Admin.Window) => void;

            /**
             * @var {Function} hide - 윈도우가 숨겨질 떄
             */
            hide?: (window: Admin.Window) => void;

            /**
             * @var {Function} hide - 윈도우가 닫힐 떄
             */
            close?: (window: Admin.Window) => void;
        }

        export interface Properties extends Admin.Component.Properties {
            /**
             * @type {boolean} modal - 모달창 여부
             */
            modal?: boolean;

            /**
             * @type {boolean} resizable - 크기조절허용 여부
             */
            resizable?: boolean;

            /**
             * @type {boolean} closable - 닫기허용 여부
             */
            closable?: boolean;

            /**
             * @type {boolean} movable - 이동허용 여부
             */
            movable?: boolean;

            /**
             * @type {boolean} maximizable - 최대화허용 여부
             */
            maximizable?: boolean;

            /**
             * @type {boolean} maximized - 최대화 여부
             */
            maximized?: boolean;

            /**
             * @type {boolean} collapsible - 최소화허용 여부
             */
            collapsible?: boolean;

            /**
             * @type {boolean} collapsed - 최소화 여부
             */
            collapsed?: boolean;

            /**
             * @type {string} collapseDirection - 최소화 방향
             */
            collapseDirection?: boolean;

            /**
             * @type {number} minWidth - 최소가로크기
             */
            minWidth?: number;

            /**
             * @type {number} maxWidth - 최대가로크기
             */
            maxWidth?: number;

            /**
             * @type {number} minHeight - 최소세로크기
             */
            minHeight?: number;

            /**
             * @type {number} maxHeight - 최대세로크기
             */
            maxHeight?: number;

            /**
             * @type {string|Admin.Title} title - 창 제목
             */
            title?: string | Admin.Title;

            /**
             * @type {Admin.Button[]} buttons - 버튼목록
             */
            buttons?: Admin.Button[];

            /**
             * @type {Admin.Component.Listeners} listeners - 이벤트리스너
             */
            listeners?: Admin.Window.Listeners;
        }
    }
    export class Window extends Admin.Component {
        static $windows: Dom;
        static windows: Map<string, Admin.Window> = new Map();
        static zIndex: number = 0;
        static observer: ResizeObserver;
        static isObserve: boolean = false;

        type: string = 'window';
        role: string = 'window';
        modal: boolean;
        resizable: boolean;
        resizer: Admin.Resizer;
        closable: boolean;
        movable: boolean;
        maximizable: boolean;
        maximized: boolean;
        collapsible: boolean;
        collapsed: boolean;
        collapseDirection: string;
        minWidth: number;
        minHeight: number;
        left: number;
        right: number;
        top: number;
        bottom: number;

        title: Admin.Title;
        buttons: Admin.Component[];

        /**
         * 윈도우를 생성한다.
         *
         * @param {Admin.Window.Properties} properties - 객체설정
         */
        constructor(properties: Admin.Window.Properties = null) {
            super(properties);

            this.layout = 'auto';
            this.modal = this.properties.modal ?? true;
            this.resizable = this.properties.resizable ?? true;
            this.closable = this.properties.closable ?? true;
            this.movable = this.properties.movable ?? true;

            this.maxWidth = this.properties.maxWidth ?? Html.get('body').getWidth();
            this.maxHeight = this.properties.maxHeight ?? Html.get('body').getHeight();

            this.minWidth = this.properties.minWidth ?? null;
            this.minHeight = this.properties.minHeight ?? null;
            this.scrollable = this.properties.scrollable ?? 'Y';

            if (this.properties.title instanceof Admin.Title) {
                this.title = this.properties.title;
            } else {
                this.title = new Admin.Title(this.properties.title ?? '');
            }

            if (this.properties.iconClass) {
                this.title.setIconClass(this.properties.iconClass);
            }

            if (this.closable == true) {
                this.title.addTool('CLOSE', 'mi mi-close', () => {
                    this.close();
                });
            }

            this.buttons = [];
            for (let button of this.properties.buttons ?? []) {
                if (button instanceof Admin.Component) {
                    this.buttons.push(button);
                } else {
                    button = new Admin.Button(button);
                    this.buttons.push(button);
                }

                button.setParent(this);
            }

            this.$setTop();
            if (this.buttons.length > 0) {
                this.$setBottom();
            }

            this.$scrollable = this.$getContent();

            this.title.setParent(this);
            this.title.setMovable(this.movable);

            Admin.Window.windows.set(this.id, this);
        }

        /**
         * 윈도우의 하위 컴포넌트를 정의한다.
         */
        initItems(): void {
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

            super.initItems();
        }

        /**
         * 전체 윈도우 랜더링 영역을 가져온다.
         *
         * @return {Dom} $windows
         */
        $getWindows(): Dom {
            if (Admin.Window.$windows !== undefined) {
                return Admin.Window.$windows;
            }

            if (Html.get('section[data-role=admin][data-type=windows]', Html.get('body')).getEl() == null) {
                Admin.Window.$windows = Html.create('section', { 'data-role': 'admin', 'data-type': 'windows' });
                Html.get('body').append(Admin.Window.$windows);
            } else {
                Admin.Window.$windows = Html.get('section[data-role=admin][data-type=windows]', Html.get('body'));
            }

            return Admin.Window.$windows;
        }

        /**
         * 윈도우의 제목 객체를 가져온다.
         *
         * @return {Admin.Title} title
         */
        getTitle(): Admin.Title {
            return this.title;
        }

        /**
         * 윈도우 최대너비를 설정한다.
         *
         * @param {string|number} maxWidth - 최대너비
         */
        setMaxWidth(maxWidth: string | number): void {
            const bodyWidth = Html.get('body').getWidth();
            maxWidth = maxWidth ?? bodyWidth;

            if (typeof maxWidth == 'string') {
                const rate = parseInt(maxWidth.replace('%', ''), 10);
                maxWidth = Math.round((bodyWidth * rate) / 100);
            }

            maxWidth = Math.min(bodyWidth, maxWidth);

            super.setMaxWidth(maxWidth);
            this.resizer?.setMaxWidth(maxWidth);
        }

        /**
         * 윈도우 최대높이를 설정한다.
         *
         * @param {string|number} maxHeight - 최대높이
         */
        setMaxHeight(maxHeight: string | number): void {
            const bodyHeight = Html.get('body').getHeight();
            maxHeight = maxHeight ?? bodyHeight;

            if (typeof maxHeight == 'string') {
                const rate = parseInt(maxHeight.replace('%', ''), 10);
                maxHeight = Math.round((bodyHeight * rate) / 100);
            }

            maxHeight = Math.min(bodyHeight, maxHeight);

            super.setMaxHeight(maxHeight);
            this.resizer?.setMaxHeight(maxHeight);
        }

        /**
         * 윈도우의 Z-INDEX 를 가져온다.
         *
         * @return {number} z-index
         */
        getIndex(): number {
            const zIndex = this.$component.getStyle('z-index');
            return zIndex.length > 0 ? parseInt(zIndex, 10) : 0;
        }

        /**
         * 윈도우를 최상단에 배치한다.
         */
        setFront(): void {
            if (this.getIndex() != Admin.Window.zIndex) {
                this.$component.setStyle('z-index', Admin.Window.zIndex + 2);
                this.updateWindows();
            }
        }

        /**
         * 윈도우를 최하단에 배치한다.
         */
        setBack(): void {
            this.$component.setStyle('z-index', 0);
        }

        /**
         * 전체 윈도우를 대상으로 윈도우 상태값을 업데이트한다.
         */
        updateWindows(): void {
            let zIndex = 0;
            let isModal = false;
            for (const window of Admin.Window.windows.values()) {
                zIndex = Math.max(zIndex, window.getIndex());
                isModal = isModal || window.modal == true;
            }

            Admin.Window.zIndex = zIndex;
            this.$getWindows().setStyleProperty('--active-z-index', zIndex);

            if (isModal == true) {
                this.$getWindows().addClass('modal');
            } else {
                this.$getWindows().removeClass('modal');
            }
        }

        /**
         * 윈도우 위치를 가져온다.
         *
         * @return {Object} position - 위치
         */
        getPosition(): { x: number; y: number } {
            const { left, top } = this.$component.getOffset();
            return {
                x: left,
                y: top,
            };
        }

        /**
         * 윈도우 위치를 설정한다.
         *
         * @param {number} x - 상단위치
         * @param {number} y - 좌측위치
         */
        setPosition(x: number, y: number): void {
            if (x == null) {
                this.$component.addClass('center');
                this.$component.setStyle('left', '');
            } else {
                this.$component.removeClass('center');
                this.$component.setStyle('left', x + 'px');
            }

            if (y == null) {
                this.$component.addClass('middle');
                this.$component.setStyle('top', '');
            } else {
                this.$component.removeClass('middle');
                this.$component.setStyle('top', y + 'px');
            }
        }

        /**
         * 윈도우를 특정좌표만큼 이동한다.
         *
         * @param {number} moveX - 이동할 X축 좌표
         * @param {number} moveY - 이동할 Y축 좌표
         */
        moveTo(moveX: number, moveY: number): void {
            const { x, y } = this.getPosition();
            this.setPosition(x + moveX, y + moveY);
        }

        /**
         * 윈도우를 출력한다.
         */
        show(): void {
            const isShow = this.fireEvent('beforeShow', [this]);
            if (isShow === false) return;

            this.$getWindows().append(this.$component);
            this.render();

            //this.setWidth(this.width);
            //this.setMaxWidth(this.maxWidth);
            //this.setHeight(this.height);
            //this.setMaxHeight(this.maxHeight);
            this.setPosition(this.top, this.left);
            this.setFront();

            super.show();

            this.$getComponent().focus();
            Admin.Window.observe();
        }

        /**
         * 윈도우를 숨긴다.
         */
        hide(): void {
            const isHide = this.fireEvent('beforeHide', [this]);
            if (isHide === false) return;

            this.updateWindows();
            if (this.hasWindow(true) == false) {
                Admin.Window.disconnect();
            }

            super.hide();
        }

        /**
         * 윈도우를 닫는다.
         */
        close(): void {
            const isClose = this.fireEvent('beforeClose', [this]);
            if (isClose === false) return;

            Admin.Window.windows.delete(this.id);
            this.remove();
            this.updateWindows();

            if (this.hasWindow(true) == false) {
                Admin.Window.disconnect();
            }

            this.fireEvent('close', [this]);
        }

        /**
         * 컴포넌트를 제거한다.
         */
        remove(): void {
            this.title?.remove();
            this.buttons.forEach((component: Admin.Component) => {
                component.remove();
            });

            super.remove();
        }

        /**
         * 윈도우가 존재하는지 확인한다.
         *
         * @param {boolean} is_visible_only - 현재 보이고 있는 윈도우만 확인할지 여부
         * @return {boolean} hasWindow
         */
        hasWindow(is_visible_only: boolean = false): boolean {
            if (is_visible_only == true) {
                return Admin.Window.windows.size > 0;
            } else {
                for (const window of Admin.Window.windows.values()) {
                    if (window.isShow() === true) {
                        return true;
                    }
                }

                return false;
            }
        }

        /**
         * 하단 버튼을 추가한다.
         *
         * @param {Admin.Component} button - 추가할 버튼
         * @param {number} position - 추가할 위치 (NULL 인 경우 마지막에 위치)
         */
        addButton(button: Admin.Component, position: number = null): void {
            if (position === null) {
                this.buttons.push(button);
            } else {
                this.buttons.splice(position, 0, button);
            }

            this.$addComponent(this.$setBottom(), button, position);
        }

        /**
         * 브라우저 크기가 변경되었을 경우, 열린 윈도우의 최대너비, 최대높이를 재조절한다.
         */
        static windowResize(): void {
            Admin.Window.windows.forEach((window) => {
                if (window.isShow() == true) {
                    window.setMaxWidth(window.maxWidth);
                    window.setMaxHeight(window.maxHeight);
                }
            });
        }

        /**
         * 브라우저의 크기가 변경되는지 관찰을 시작한다.
         */
        static observe(): void {
            if (Admin.Window.observer === undefined) {
                Admin.Window.observer = new ResizeObserver(() => {
                    if (Admin.Window.isObserve == true) {
                        Admin.Window.windowResize();
                    }

                    Admin.Window.isObserve = true;
                });
            }

            if (Admin.Window.isObserve === false) {
                Admin.Window.observer.observe(document.body);
            }
        }

        /**
         * 브라우저의 크기 변경 관찰자를 중단한다.
         */
        static disconnect(): void {
            if (Admin.Window.isObserve == true) {
                Admin.Window.observer?.disconnect();
                Admin.Window.isObserve = false;
            }
        }

        /**
         * 윈도우 제목 레이아웃을 랜더링한다.
         */
        renderTop(): void {
            const $top = this.$getTop();

            if (this.title !== null) {
                $top.append(this.title.$getComponent());
                this.title.render();
            }
        }

        /**
         * 윈도우 하단 레이아웃을 랜더링한다.
         */
        renderBottom(): void {
            const $bottom = this.$getBottom();

            for (const button of this.buttons) {
                $bottom.append(button.$getComponent());
                button.render();
            }
        }

        /**
         * 윈도우 레이아웃을 랜더링한다.
         */
        render(): void {
            super.render();

            if (this.resizable == false || this.resizer !== undefined) return;

            this.resizer = new Admin.Resizer(this.$component, this.$getWindows(), {
                directions: [true, true, true, true],
                listeners: {
                    end: (_$target: Dom, rect: DOMRect) => {
                        this.setPosition(rect.x, rect.y);
                        this.setWidth(rect.width);
                        this.setHeight(rect.height);
                    },
                },
            });
        }

        /**
         * 그리드패널이 화면상에 출력되었을 때 이벤트를 처리한다.
         */
        onRender(): void {
            super.onRender();

            this.$getComponent().on('keydown', (e: KeyboardEvent) => {
                if (e.key == 'Escape' && this.closable === true) {
                    this.close();
                }

                e.stopPropagation();
            });
        }
    }
}
