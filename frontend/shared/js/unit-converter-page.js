document.addEventListener('DOMContentLoaded', async () => {
    await utils.renderComponent('sidebar-container', 'shared/components/sidebar.html');
    await utils.renderComponent('header-container', 'shared/components/header.html');

    await utils.initCommonPage();

    const converterUI = new UnitConverterUI('unitConverterContainer');
    await converterUI.init();
});
