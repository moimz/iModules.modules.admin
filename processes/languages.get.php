<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 언어코드 목록을 가져온다.
 *
 * @file /modules/admin/processes/languages.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 26.
 *
 * @var \modules\admin\Admin $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 언어팩 경로에서 언어팩 파일목록을 가져온다.
 */
$records = [];
$languages = File::getDirectoryItems(Configs::get('path') . '/languages');
foreach ($languages as $language) {
    if (preg_match('/([a-z]{2})\.json$/', $language, $match) == true) {
        $json = json_decode(File::read($language));
        if ($json == null || isset($json->language) == false) {
            continue;
        }
        $records[] = ['language' => $match[1], 'name' => $json->language];
    }
}

$results->success = true;
$results->records = $records;
