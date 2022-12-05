/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 타이틀 클래스를 정의한다.
 *
 * @file /modules/admin/scripts/Admin.Title.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2022. 12. 1.
 */
namespace Admin {
    export class Title extends Admin.Component {
        type: string = 'title';
        role: string = 'title';
        title: string;
        iconClass: string;
        $title: Dom;

        /**
         * 텍스트 객체를 생성한다.
         *
         * @param {Object|string} properties 객체설정
         */
        constructor(properties: { [key: string]: any } | string) {
            if (typeof properties == 'string') {
                const title = properties;
                properties = { title: title };
            }
            super(properties);

            this.title = this.properties.title ?? '';
            this.iconClass = this.properties.iconClass ?? '';
            this.$title = Html.create('span');
        }

        /**
         * 제목 아이콘을 설정한다.
         *
         * @param {string} iconClass
         */
        setIconClass(iconClass: string): void {
            this.iconClass = iconClass;
        }

        /**
         * 레이아웃을 렌더링한다.
         */
        render() {
            if (this.isRenderable() == true) {
                this.$title.text(this.title);
                this.$component.append(this.$title);
                this.rendered();
            }
            super.render();
        }
    }
}
