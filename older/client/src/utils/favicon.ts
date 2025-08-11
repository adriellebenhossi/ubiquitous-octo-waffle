
export function updateFavicon(iconPath: string, iconType: string = 'upload') {
  const favicon = document.getElementById('favicon') as HTMLLinkElement;
  const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
  
  if (favicon && iconPath) {
    // Para ícones predefinidos, usar o diretório /icons/ (agora servido do banco quando necessário)
    // Para ícones uploadados, usar o caminho completo
    if (iconType === 'preset') {
      const timestamp = Date.now();
      // As rotas /icons/ agora fazem fallback automático para o banco de dados
      favicon.href = `/icons/favicon.ico?v=${timestamp}`;
      favicon.type = 'image/x-icon';
      if (appleTouchIcon) {
        appleTouchIcon.href = `/icons/apple-touch-icon.png?v=${timestamp}`;
      }
      console.log('🔄 Favicon atualizado no navegador:', favicon.href);
    } else if (iconPath) {
      const timestamp = Date.now();
      favicon.href = `${iconPath}?v=${timestamp}`;
      favicon.type = 'image/png';
      if (appleTouchIcon) {
        appleTouchIcon.href = `${iconPath}?v=${timestamp}`;
      }
      console.log('🔄 Favicon personalizado atualizado:', favicon.href);
    }
  }
}

export function loadSiteFavicon() {
  // Carrega o favicon do site a partir da configuração
  fetch('/api/config')
    .then(response => response.json())
    .then(configs => {
      const siteIconConfig = configs.find((c: any) => c.key === 'site_icon');
      if (siteIconConfig?.value?.iconPath) {
        updateFavicon(siteIconConfig.value.iconPath, siteIconConfig.value.iconType || 'upload');
      }
    })
    .catch(() => {
      // Ignora erros silenciosamente
    });
}
