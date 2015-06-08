//custom function to add even listener to every element with the same class
function addEventListenerByClass(className, event, fn) {
    var elements = document.getElementsByClassName(className);
	Array.prototype.forEach.call(elements, function(el, i){
		elements[i].addEventListener(event, fn);
	});
}

//custom function to remove even listener to every element with the same class
function removeEventListenerByClass(className, event, fn) {
    var elements = document.getElementsByClassName(className);
	Array.prototype.forEach.call(elements, function(el, i){
		elements[i].removeEventListener(event, fn);
	});
}