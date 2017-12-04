export function getParams(name, url) {
  var search = url.split('?')[1];// || window.location.search.substr(1);
  if(!search) return;
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  var r = search.match(reg);
  if (r != null) {
    return decodeURIComponent(r[2]);
  }
  return null;
}


