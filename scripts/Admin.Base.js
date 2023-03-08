/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자모듈에서 사용되는 컴포넌트의 공통 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Base.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2022. 12. 20.
 */
var Admin;
(function (Admin) {
    Admin.items = new Map();
    Admin.index = 0;
    Admin.currentComponent = null;
    /**
     * 객체를 등록한다.
     *
     * @param {Admin.Base} item - 객체
     */
    function set(item) {
        if (Admin.items.has(item.id) == true) {
            console.error('[DUPLICATED ID]', item.id, item);
            return;
        }
        Admin.items.set(item.id, item);
    }
    Admin.set = set;
    /**
     * 객체를 가져온다.
     *
     * @param {string} id - 가져올 객체 고유값
     * @return {Admin.Base} item - 객체클래스
     */
    function get(id) {
        return Admin.items.has(id) == true ? Admin.items.get(id) : null;
    }
    Admin.get = get;
    /**
     * 객체가 존재하는지 확인한다..
     *
     * @param {string} id - 확인할 객체 고유값
     * @return {boolean} has
     */
    function has(id) {
        return Admin.items.has(id);
    }
    Admin.has = has;
    /**
     * 컴포넌트를 가져온다.
     *
     * @param {string} id - 가져올 컴포넌트 고유값
     * @return {Admin.Component} item - 컴포넌트클래스
     */
    function getComponent(id) {
        return Admin.items.has(id) == true && Admin.items.get(id) instanceof Admin.Component
            ? Admin.items.get(id)
            : null;
    }
    Admin.getComponent = getComponent;
    /**
     * 객체를 제거한다.
     *
     * @param {string} id - 제거할 객체 고유값
     */
    function remove(id) {
        Admin.items.delete(id);
    }
    Admin.remove = remove;
    /**
     * 컴포넌트 일련번호를 가져온다.
     *
     * @return {number} index - 일련번호
     */
    function getIndex() {
        return ++Admin.index;
    }
    Admin.getIndex = getIndex;
    /**
     * 언어팩을 불러온다.
     *
     * @param string $text 언어팩코드
     * @param ?array $placeHolder 치환자
     * @return array|string|null $message 치환된 메시지
     */
    async function getText(text, placeHolder = null) {
        return Language.getText(text, placeHolder, ['/modules/admin', '/']);
    }
    Admin.getText = getText;
    /**
     * 언어팩 문자열이 위치할 DOM 을 반환하고, 언어팩이 비동기적으로 로딩되면 언어팩 내용으로 변환한다.
     *
     * @param string $text 언어팩코드
     * @param ?array $placeHolder 치환자
     * @return array|string|null $message 치환된 메시지
     */
    function printText(text, placeHolder = null) {
        return Language.printText(text, placeHolder, ['/modules/admin', '/']);
    }
    Admin.printText = printText;
    /**
     * 아이모듈 기본 URL 경로를 가져온다.
     *
     * @return {string} baseUrl
     */
    function getBase() {
        return Html.get('body').getAttr('data-base');
    }
    Admin.getBase = getBase;
    /**
     * 관리자 기본 URL 경로를 가져온다.
     *
     * @return {string} baseUrl
     */
    function getUrl() {
        const is_rewrite = Html.get('body').getAttr('data-rewrite') === 'true';
        const route = '/admin';
        return Admin.getBase() + (is_rewrite === true ? route : '/?route=' + route);
    }
    Admin.getUrl = getUrl;
    /**
     * 프로세스 URL 경로를 가져온다.
     *
     * @return {string} baseUrl
     */
    function getProcessUrl(type, name, path) {
        const is_rewrite = Html.get('body').getAttr('data-rewrite') === 'true';
        const route = '/' + type + '/' + name + '/process/' + path;
        return Admin.getBase() + (is_rewrite === true ? route : '/?route=' + route);
    }
    Admin.getProcessUrl = getProcessUrl;
    /**
     * 관리자 UI 처리가 준비되었을 때 이벤트리스너를 등록한다.
     *
     * @param {EventListener} listener - 이벤트리스너
     *
     */
    function ready(listener) {
        this.viewportListener = listener;
    }
    Admin.ready = ready;
    /**
     * 세션 스토리지의 데이터를 처리한다.
     *
     * @param {string} key - 데이터키
     * @param {any} value - 저장할 데이터 (undefined 인 경우 저장된 데이터를 가져온다.)
     * @return {any} data - 데이터를 가져올 경우 해당 데이터값
     */
    function session(key, value = undefined) {
        const session = window.sessionStorage?.getItem('iModules-Admin-Session') ?? null;
        const datas = session !== null ? JSON.parse(session) : {};
        if (value === undefined) {
            return datas[key] ?? null;
        }
        else {
            datas[key] = value;
            window.sessionStorage?.setItem('iModules-Admin-Session', JSON.stringify(datas));
        }
    }
    Admin.session = session;
    class Base {
        id;
        properties;
        listeners = {};
        /**
         * 객체를 생성한다.
         *
         * @param {Object} properties - 객체설정
         */
        constructor(properties = null) {
            this.properties = properties ?? {};
            this.id = properties?.id ?? 'Admin-' + Admin.getIndex();
            if (this.properties.listeners !== undefined) {
                for (const name in this.properties.listeners) {
                    this.addEvent(name, this.properties.listeners[name]);
                }
            }
            Admin.set(this);
        }
        /**
         * 객체 고유값을 가져온다.
         *
         * @return {string} - 고유값
         */
        getId() {
            return this.id;
        }
        /**
         * 객체를 제거한다.
         */
        remove() {
            Admin.remove(this.id);
        }
        /**
         * 이벤트리스너를 등록한다.
         *
         * @param {string} name - 이벤트명
         * @param {Function} listener - 이벤트리스너
         */
        addEvent(name, listener) {
            if (this.listeners[name] == undefined) {
                this.listeners[name] = [];
            }
            this.listeners[name].push(listener);
        }
        /**
         * 이벤트를 발생시킨다.
         *
         * @param {string} name - 이벤트명
         * @param {any[]} params - 이벤트리스너에 전달될 데이터
         * @return {boolean} result
         */
        fireEvent(name, params = []) {
            if (this.listeners[name] !== undefined) {
                for (const listener of this.listeners[name]) {
                    if (listener(...params) === false) {
                        return false;
                    }
                }
            }
            return true;
        }
        /**
         * 이벤트를 실행한다.
         *
         * @param {string} name - 이벤트명
         */
        triggerEvent(name) {
            const methodName = 'on' + name.replace(/^[a-z]/, (char) => char.toUpperCase());
            if (typeof this[methodName] == 'function') {
                this[methodName]();
            }
        }
    }
    Admin.Base = Base;
    class Modules {
        static classes = {};
        /**
         * 모듈 관리자 클래스를 가져온다.
         *
         * @param {string} name - 모듈명
         * @return {?Admin.Module} module - 모듈 클래스
         */
        static get(name) {
            if (Modules.classes[name] === undefined) {
                const namespaces = name.split('/');
                const namespace = namespaces.shift().replace(/^[a-z]/, (char) => char.toUpperCase());
                if (window[namespace] === undefined) {
                    return null;
                }
                let classname = window[namespace];
                for (let namespace of namespaces) {
                    namespace = namespace.replace(/^[a-z]/, (char) => char.toUpperCase());
                    if (classname[namespace] === undefined) {
                        return null;
                    }
                    classname = classname[namespace];
                }
                if (typeof classname == 'function' && classname.prototype instanceof Admin.Module) {
                    Admin.Modules[name] = new classname(name);
                    return Admin.Modules[name];
                }
                return null;
            }
            return Admin.Modules[name];
        }
    }
    Admin.Modules = Modules;
    class Module {
        name;
        constructor(name) {
            this.name = name;
        }
    }
    Admin.Module = Module;
})(Admin || (Admin = {}));
