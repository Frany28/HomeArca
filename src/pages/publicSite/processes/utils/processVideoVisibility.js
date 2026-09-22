const PROCESS_MOBILE_QUERY = "(max-width: 767px)";
const PROCESS_MOBILE_VIDEO_LIMIT = 6;

function getVisibleProcessVideos(videos, mobileLayout = false) {
  const safeVideos = Array.isArray(videos) ? videos : [];

  return mobileLayout
    ? safeVideos.slice(0, PROCESS_MOBILE_VIDEO_LIMIT)
    : safeVideos;
}

export {
  PROCESS_MOBILE_QUERY,
  PROCESS_MOBILE_VIDEO_LIMIT,
  getVisibleProcessVideos,
};
