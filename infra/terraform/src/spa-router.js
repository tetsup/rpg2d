function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri.startsWith('/editor/')) {
    if (!hasExtension(uri)) {
      request.uri = '/editor/index.html';
    }
  } else if (uri.startsWith('/runtime/')) {
    if (!hasExtension(uri)) {
      request.uri = '/runtime/index.html';
    }
  } else if (uri.startsWith('/')) {
    if (!hasExtension(uri)) {
      request.uri = '/landing/index.html';
    } else {
      request.uri = `/landing${uri}`;
    }
  }
  return request;
}

function hasExtension(uri) {
  var lastSegment = uri.substring(uri.lastIndexOf('/') + 1);

  return lastSegment.includes('.');
}
