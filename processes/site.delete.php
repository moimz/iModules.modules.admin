<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 사이트를 삭제한다.
 *
 * @file /modules/admin/processes/site.delete.php
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
$language = Request::get('language', true);

if (
    \iModules::db()
        ->select()
        ->from(\iModules::table('sites'))
        ->where('host', $host)
        ->count() <= 1
) {
    $results->success = false;
    $results->message = $me->getErrorText('DELETE_SITE_FAILED');
    return;
}

$site = \iModules::db()
    ->select()
    ->from(\iModules::table('sites'))
    ->where('host', $host)
    ->where('language', $language)
    ->getOne();
if ($site === null) {
    $results->success = false;
    $results->message = $me->getErrorText('NOT_FOUND_DATA');
    return;
}

/**
 * @var \modules\admin\admin\Admin $mAdmin
 */
$mAdmin = $me->getAdmin();
$mAdmin->deleteSite($host, $language);

Cache::remove('domains');
Cache::remove('sites');
Cache::remove('contexts');

$results->success = true;
