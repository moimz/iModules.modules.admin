<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 모듈을 설치한다.
 *
 * @file /modules/admin/processes/module.post.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 26.
 *
 * @var \modules\admin\Admin $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

$errors = [];
$name = Input::get('name', $errors);
$module = Modules::get($name);
if ($module === null) {
    $results->success = false;
    $results->message = $me->getErrorText('NOT_FOUND_MODULE', ['module' => $name]);
    return;
}

if ($module->isInstalled() == true) {
    /**
     * 관리자권한이 존재하는지 확인한다.
     */
    if ($me->getAdmin()->checkPermission('modules', ['configs']) == false) {
        $results->success = false;
        $results->message = $me->getErrorText('FORBIDDEN');
        return;
    }
} else {
    /**
     * 관리자권한이 존재하는지 확인한다.
     */
    if ($me->getAdmin()->checkPermission('modules', ['install']) == false) {
        $results->success = false;
        $results->message = $me->getErrorText('FORBIDDEN');
        return;
    }
}

$configs = Input::get('configs') ? $module->getPackage()->getConfigs(Input::get('configs')) : null;

$installable = Modules::installable($name);
if ($installable->success == false) {
    $results->success = false;
    if (isset($installable->dependencies['core']) == true) {
        $results->message = $me->getErrorText('DEPENDENCY_ERROR_CORE', [
            'requirement' => $installable->dependencies['core']->requirement,
            'current' => $installable->dependencies['core']->current,
        ]);
    } else {
        $dependencies = [];
        foreach ($installable->dependencies as $name => $versions) {
            $dependencies[] = $me->getErrorText('DEPENDENCY_ERROR_MODULE', [
                'name' => $name,
                'requirement' => $versions->requirement,
                'current' => $versions->current,
            ]);
        }
        $results->message = implode('<br>', $dependencies);
    }
    return;
}

$success = Modules::install($name, $configs);

Cache::remove('modules');

$results->success = $success === true;
if ($success !== true) {
    $results->message = $success;
}
