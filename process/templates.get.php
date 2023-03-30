<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 템플릿 목록을 가져온다.
 *
 * @file /modules/admin/process/templates.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 3. 28.
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

$targetType = Request::get('targetType', true);
$targetName = Request::get('targetName', true);

if ($targetType == 'module') {
    $component = Modules::get($targetName);
}

/**
 * @var Template[] $templates
 */
$templates = [];
$names = File::getDirectoryItems($component->getPath() . '/templates', 'directory', false);
foreach ($names as $name) {
    $templates[] = new Template($component, (object) ['name' => basename($name)]);
}

/**
 * 사이트테마는 모듈의 템플릿을 가지고 있을 수 있으므로, 사이트테마 폴더에서 템플릿을 검색한다.
 */
$themes = File::getDirectoryItems(Configs::path() . '/themes', 'directory', false);
foreach ($themes as $name) {
    $theme = basename($name);
    $names = File::getDirectoryItems(
        $name . '/' . $component->getType() . 's/' . $component->getName(),
        'directory',
        false
    );
    foreach ($names as $name) {
        $templates[] = new Template($component, (object) ['name' => '/' . $theme . '/' . basename($name)]);
    }
}

$modules = Modules::all();
foreach ($modules as $module) {
    if ($module->isTheme() == true) {
        $themes = File::getDirectoryItems($module->getPath() . '/themes', 'directory', false);
        foreach ($themes as $name) {
            $theme = basename($name);
            $names = File::getDirectoryItems(
                $name . '/' . $component->getType() . 's/' . $component->getName(),
                'directory',
                false
            );
            foreach ($names as $name) {
                $templates[] = new Template(
                    $component,
                    (object) ['name' => '/modules/' . $module->getName() . '/' . $theme . '/' . basename($name)]
                );
            }
        }
    }
}

$records = [];
foreach ($templates as $template) {
    $records[] = [
        'name' => $template->getPathName(),
        'title' => $template->getTitle(),
        'dir' => $template->getBase(),
        'screenshot' => $template->getScreenshot() ?? $mAdmin->getDir() . '/images/noimage.png',
    ];
}

$results->success = true;
$results->records = $records;