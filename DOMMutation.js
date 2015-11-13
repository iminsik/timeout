function mutationHandler(mutationRecords) {
  'use strict';
  console.log('Updated...');
}
var targetNodes         = $("body");
var MutationObserver    = window.MutationObserver || window.WebKitMutationObserver;
var myObserver          = new MutationObserver(mutationHandler);
var obsConfig           = { childList: true, characterData: true, attributes: true, subtree: true };

//--- Add a target node to the observer. Can only add one node at a time.
targetNodes.each(function () {
  'use strict';
  myObserver.observe(this, obsConfig);
});
