/**
 * Created by harsh.l on 24/09/16.
 */
'use strict';
angular.module('taggApp').filter('propsFilter', function() {
  return function(items, props) {
    var out = [];

    if (angular.isArray(items)) {
      var keys = Object.keys(props);

      items.forEach(function(item) {
        var itemMatches = false;

        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          var text = props[prop].toLowerCase();
          if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
            itemMatches = true;
            break;
          }
        }

        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      // Let the output be the input untouched
      out = items;
    }

    return out;
  };
});
angular.
	module('taggApp').
	component('msgView', {
		templateUrl: 'templates/view.html',
		controller: ['$location', '$scope', 'TagsFactory', 'FileFactory', 'Restangular', 'MessageFactory', 'ContentFactory', '$rootScope',
			function ViewController($location, $scope, TagsFactory, FileFactory, Restangular, MessageFactory, ContentFactory, root){
				var self = this;
				self.newTagValue = "";
				self.displayMessage;
				self.displayAttachments = [];
				self.displayTags = [];
				var content_json;

				self.messageDetails = {

				};

				var queryParams = $location.search();
				var cid = queryParams.cid;
				var flockEvent = JSON.parse(queryParams.flockEvent);

				
				self.messageDetails.from = flockEvent.chat; self.messageDetails.fromName = flockEvent.chatName;
				root.userId = flockEvent.userId || 'u:v77sdynhzi74zy44';

				ContentFactory.get({'contentId': cid, 'userId': root.userId}, function(data) {
					console.log(data);
					content_json = JSON.parse(data.content_json);

					// content_json received, now 

					// get message content

					MessageFactory.get({'messageId': content_json.message, 'userId': root.userId}, function(msg) {
						self.displayMessage = msg.message_content;

					});

					for(var i = 0; i < content_json.tags.length; i++) {
						TagsFactory.getTag({'tagId': content_json.tags[i], 'userId': root.userId}, function(tagData) {
							self.displayTags.push(tagData);
							//console.log(self.displayTags);
						});
					}


					for(var i = 0; i < content_json.attachments.length; i++) {
						FileFactory.get({'fileId': content_json.attachments[i], 'userId': root.userId}, function(fileData) {
							self.displayAttachments.push(fileData);
						});
					}

				});

				$scope.openUrl = function (url) {
					console.log(url);
			        flock.openBrowser(url);
			      }

			    self.saveTag = function () {
					// on click event to save that tag in tags[] and update in db
					var tag = {
						'tag_value': self.newTagValue,
						'userId': root.userId
					};
					TagsFactory.save(tag, function (data) {
						self.newTagValue = "";
						self.displayTags.push(data);
					});
				};


				self.submit = function() {
						content_json.tags = self.displayTags.map(function(val) {return val.id;} );

						var cdata = {
							"to": 'a',
							"userId": root.userId,
							"content_json": content_json
						}
						ContentFactory.save(cdata, function(data) {
							console.log(data);
						});
				};
				self.closeWindow = function () {

					flock.close();
				}
			}
		]
	});