export function mountLightbox(signal: AbortSignal) {
  const lightbox = document.querySelector('[data-lightbox]');
  const lightboxImage = document.querySelector('[data-lightbox-image]');
  const lightboxCaption = document.querySelector('[data-lightbox-caption]');
  if (document.body.dataset.featureLightbox === 'true') {
    const openLightbox = (image: HTMLImageElement) => {
      if (!(lightbox instanceof HTMLDialogElement) || !(lightboxImage instanceof HTMLImageElement)) return;
      const caption = image.closest('figure')?.querySelector('figcaption')?.textContent?.trim() || '';
      lightboxImage.src = image.src;
      lightboxImage.alt = image.alt;
      if (lightboxCaption) lightboxCaption.textContent = caption;
      lightbox.showModal();
    };
    document.querySelectorAll<HTMLImageElement>('.article-prose figure img').forEach((image) => {
      const caption = image.closest('figure')?.querySelector('figcaption')?.textContent?.trim();
      image.dataset.lightboxTarget = '';
      image.tabIndex = 0;
      image.setAttribute('role', 'button');
      image.setAttribute('aria-haspopup', 'dialog');
      image.setAttribute('aria-label', `放大查看：${caption || image.alt || '文章图片'}`);
      image.addEventListener('click', (event) => {
        event.preventDefault();
        openLightbox(image);
      }, { signal });
      image.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        openLightbox(image);
      }, { signal });
    });
  }
  document.querySelector('[data-lightbox-close]')?.addEventListener('click', () => {
    if (lightbox instanceof HTMLDialogElement) lightbox.close();
  }, { signal });


}
