/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자모듈 UI 를 처리하기 위한 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2022. 12. 1.
 */
var Admin;
(function (Admin) {
    Admin.components = {};
    Admin.index = 0;
    /**
     * 컴포넌트를 등록한다.
     *
     * @param {Admin.Base} component - 컴포넌트 객체
     */
    function set(component) {
        this.components[component.id] = component;
    }
    Admin.set = set;
    /**
     * 컴포넌트를 가져온다.
     *
     * @param {string} id - 가져올 컴포넌트 고유값
     * @return {Admin.Base} component - 컴포넌트
     */
    function get(id) {
        return this.components[id];
    }
    Admin.get = get;
    /**
     * 컴포넌트 일련번호를 가져온다.
     *
     * @return {number} index - 일련번호
     */
    function getIndex() {
        return ++this.index;
    }
    Admin.getIndex = getIndex;
    /**
     * 관리자 UI 처리가 준비되었을 때 이벤트리스너를 등록한다.
     *
     * @param {EventListener} listener - 이벤트리스너
     */
    function ready(listener) {
        Html.ready(listener);
    }
    Admin.ready = ready;
})(Admin || (Admin = {}));
