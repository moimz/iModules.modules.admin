<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 사이트 목록을 가져온다.
 *
 * @file /modules/admin/processes/sites.get.php
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
 * 관리자권한이 존재하는지 확인한다.
 */
if ($me->getAdmin()->checkPermission('sitemap', ['sites']) == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$host = Request::get('host', true);
$sites = Domains::has($host)?->getSites() ?? [];

$records = [];
foreach ($sites as $site) {
    $record = new stdClass();
    $record->host = $site->getHost();
    $record->language = $site->getLanguage();
    $record->title = $site->getTitle();

    $records[] = $record;
}

$results->success = true;
$results->records = $records;
