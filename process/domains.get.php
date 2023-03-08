<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 도메인 목록을 가져온다.
 *
 * @file /modules/admin/process/domains.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 3. 3.
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 * @var \modules\admin\Admin $mAdmin
 */
$mAdmin = Modules::get('admin');
if ($mAdmin->checkPermission('/sites') == false) {
    $results->success = false;
    $results->message = $mAdmin->getErrorText('FORBIDDEN');
    return;
}

$domains = Domains::all();
$records = [];
foreach ($domains as $domain) {
    $record = new stdClass();
    $record->host = $domain->getHost();

    $records[] = $record;
}

$results->success = true;
$results->records = $records;