/**
 * 이 파일은 Aui 라이브러리의 일부입니다. (https://www.imodules.io)
 *
 * 데이터셋 클래스를 정의한다.
 *
 * @file /scripts/Aui.Data.ts
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 23.
 */
namespace Aui {
    export class Data {
        originRecords: Aui.Data.Record[] = [];
        records: Aui.Data.Record[] = [];
        fields: { [key: string]: 'int' | 'float' | 'string' | 'boolean' | 'object' } = {};
        primaryKeys: string[] = [];
        sorting: boolean;
        sorters: { [field: string]: 'ASC' | 'DESC' };
        filtering: boolean;
        filters: { [field: string]: { value: any; operator: string } };
        filterMode: 'OR' | 'AND' = 'AND';

        /**
         * 데이터셋을 생성한다.
         *
         * @param {Object} records - 데이터
         * @param {Object} fields - 필드명
         */
        constructor(
            records: { [key: string]: any }[],
            fields: (string | { name: string; type: 'int' | 'float' | 'string' | 'boolean' | 'object' })[] = [],
            primaryKeys: string[] = []
        ) {
            this.fields = {};
            for (const field of fields) {
                if (typeof field == 'string') {
                    this.fields[field] = 'string';
                } else {
                    this.fields[field.name] = field.type;
                }
            }

            this.primaryKeys = primaryKeys;

            for (const record of records) {
                for (const key in record) {
                    if (this.fields[key] !== undefined) {
                        record[key] = this.setType(record[key], this.fields[key]);
                    }
                }

                this.records.push(new Aui.Data.Record(record, this.primaryKeys));
            }

            this.originRecords = this.records;
            this.sorting = false;
            this.sorters = null;
            this.filtering = false;
            this.filters = null;
        }

        /**
         * 데이터를 타입을 지정하여 반환한다.
         *
         * @param {any} value - 데이터
         * @param {'int'|'float'|'string'|'boolean'|'object'} type - 타입
         * @return {any} value - 타입지정된 데이터
         */
        setType(value: any, type: 'int' | 'float' | 'string' | 'boolean' | 'object'): any {
            if (value === null || value === undefined) {
                return null;
            }

            switch (type) {
                case 'int':
                    value = parseInt(value, 10);
                    break;

                case 'float':
                    value = parseFloat(value);
                    break;

                case 'boolean':
                    value = value == 'true' || value == 'TRUE' || value === true || value === 1;
                    break;

                case 'string':
                    value = value.toString();
                    break;
            }

            return value;
        }

        /**
         * 전체 데이터를 가져온다.
         *
         * @return {Aui.Data.Record[]} records - 데이터 레코드셋
         */
        getRecords(): Aui.Data.Record[] {
            return this.records;
        }

        /**
         * 데이터 갯수를 가져온다.
         *
         * @return {number} count
         */
        getCount(): number {
            return this.records.length;
        }

        /**
         * 데이터를 추가한다.
         *
         * @param {Object[]} records
         */
        add(records: { [key: string]: any }[]): void {
            for (const record of records) {
                for (const key in record) {
                    if (this.fields[key] !== undefined) {
                        record[key] = this.setType(record[key], this.fields[key]);
                    }
                }

                this.records.push(new Aui.Data.Record(record));
            }
        }

        /**
         * 데이터를 정렬한다.
         *
         * @param {Object} sorters - 정렬기준
         * @param {boolean} execute - 실제 정렬을 할지 여부
         */
        async sort(sorters: { [field: string]: 'ASC' | 'DESC' }, execute: boolean = true): Promise<void> {
            if (execute === false) {
                this.sorters = sorters;
                return;
            }

            if (this.sorting == true) {
                return;
            }

            if (sorters === null) {
                this.sorters = null;
                return;
            }

            this.sorting = true;
            this.records.sort((left: Aui.Data.Record, right: Aui.Data.Record) => {
                for (const field in sorters) {
                    const direction = sorters[field].toUpperCase() == 'DESC' ? 'DESC' : 'ASC';
                    const leftValue = left.get(field);
                    const rightValue = right.get(field);

                    if (leftValue < rightValue) {
                        return direction == 'DESC' ? 1 : -1;
                    } else if (leftValue > rightValue) {
                        return direction == 'ASC' ? 1 : -1;
                    }
                }

                return 0;
            });
            this.sorters = sorters;
            this.sorting = false;
        }

        /**
         * 데이터를 필터링한다.
         *
         * @param {Object} filters - 필터기준
         * @param {'OR'|'AND'} filterMode - 필터모드
         * @param {boolean} execute - 실제 필터링을 할지 여부
         */
        async filter(
            filters: { [field: string]: { value: any; operator: string } },
            filterMode: 'OR' | 'AND' = 'AND',
            execute: boolean = true
        ): Promise<void> {
            if (execute === false) {
                this.filters = filters;
                return;
            }

            if (this.filtering == true) {
                return;
            }

            if (filters === null) {
                this.filters = null;
                this.records = this.originRecords;
                return;
            }

            this.filtering = true;
            if (Object.keys(filters).length > 0) {
                const records: Aui.Data.Record[] = [];
                for (const record of this.originRecords) {
                    let matched = false;
                    for (const field in filters) {
                        const filter = filters[field];
                        const value = record.get(field) ?? null;

                        let passed = true;
                        switch (filter.operator) {
                            case '=':
                                if (value !== filter.value) {
                                    passed = false;
                                }
                                break;

                            case '!=':
                                if (value === filter.value) {
                                    passed = false;
                                }
                                break;

                            case '>=':
                                if (value < filter.value) {
                                    passed = false;
                                }
                                break;

                            case '>':
                                if (value <= filter.value) {
                                    passed = false;
                                }
                                break;

                            case '<=':
                                if (value > filter.value) {
                                    passed = false;
                                }
                                break;

                            case '<':
                                if (value >= filter.value) {
                                    passed = false;
                                }
                                break;

                            case 'in':
                                if (
                                    Array.isArray(filter.value) == false ||
                                    Array.isArray(value) == true ||
                                    filter.value.includes(value) == false
                                ) {
                                    passed = false;
                                }
                                break;

                            case 'inset':
                                if (
                                    Array.isArray(value) == false ||
                                    Array.isArray(filter.value) == true ||
                                    value.includes(filter.value) == false
                                ) {
                                    passed = false;
                                }
                                break;

                            case 'like':
                                if (value === null || value.search(filter.value) == -1) {
                                    passed = false;
                                }
                                break;

                            case 'likecode':
                                const keycode = Format.keycode(filter.value);
                                const valuecode = value === null ? null : Format.keycode(value);

                                if (valuecode === null || valuecode.search(keycode) == -1) {
                                    passed = false;
                                }
                                break;

                            default:
                                passed = false;
                        }

                        matched = matched || passed;

                        if ((filterMode == 'AND' && matched == false) || (filterMode == 'OR' && matched == true)) {
                            break;
                        }
                    }

                    if (matched == true) {
                        records.push(record);
                    }
                }

                this.records = records;
            } else {
                this.records = this.originRecords;
            }

            this.filters = filters;
            this.filtering = false;
        }
    }

    export namespace Data {
        export class Record {
            primaryKeys: string[] = [];
            hash: string;
            data: { [key: string]: any };

            /**
             * 데이터 레코드를 생성한다.
             *
             * @param {Object} data - 데이터
             * @param {string[]} primaryKeys - 고유값
             */
            constructor(data: { [key: string]: any }, primaryKeys: string[] = []) {
                this.data = data;
                this.primaryKeys = primaryKeys;
            }

            /**
             * 데이터를 가져온다.
             *
             * @param {string} key - 가져올 데이터키
             * @return {any} value
             */
            get(key: string): any {
                return this.data[key] ?? null;
            }

            /**
             * 데이터의 모든 키값을 가져온다.
             *
             * @return {string[]} keys
             */
            getKeys(): string[] {
                return Object.keys(this.data);
            }

            /**
             * 고유값을 가져온다.
             *
             * @return {Object} primary
             */
            getPrimary(): { [key: string]: any } {
                let primaryKeys = {};
                let keys = this.primaryKeys;
                if (keys.length == 0) {
                    keys = this.getKeys();
                }

                for (const key of keys) {
                    primaryKeys[key] = this.data[key] ?? null;
                }

                return primaryKeys;
            }

            /**
             * 데이터의 고유값 해시(SHA1)를 가져온다.
             *
             * @returns {string} hash
             */
            getHash(): string {
                if (this.hash === undefined) {
                    this.hash = Format.sha1(JSON.stringify(this.getPrimary()));
                }

                return this.hash;
            }

            /**
             * 현재 레코드가 특정 데이터와 일치하는지 확인한다.
             *
             * @param {Aui.Data.Record|Object} matcher - 일치여부를 확인할 레코드 또는 데이터
             * @return {boolean} is_equal - 일치여부
             */
            isEqual(matcher: Aui.Data.Record | { [key: string]: any }): boolean {
                let data: { [key: string]: any } = null;
                if (matcher instanceof Aui.Data.Record) {
                    data = matcher.data;
                } else {
                    data = matcher;
                }

                let keys = this.primaryKeys;
                if (keys.length == 0) {
                    keys = this.getKeys();
                }

                for (const key of keys) {
                    if (data[key] === undefined || data[key] !== this.data[key]) {
                        return false;
                    }
                }

                return true;
            }
        }
    }
}