

function Homepage() {

  const url = window.location.toString();
  const splitParams = url.split('?');
  var addParams = '';
  if ( splitParams.length > 1 ) {
    addParams = '?' + splitParams[1];
  }
  window.location.replace("https://futuremints.com" + window.location.pathname + addParams);
}

export default Homepage;
