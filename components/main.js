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
angular.module('taggApp').directive('fileModel', ['$parse', function ($parse) {
return {
    restrict: 'A',
    link: function(scope, element, attrs) {
        var model = $parse(attrs.fileModel);
        var modelSetter = model.assign;

        element.bind('change', function(){
            scope.$apply(function(){
                modelSetter(scope, element[0].files[0]);
            });
        });
    }
};
}]);
angular.
	module('taggApp').
	component('home', {
		templateUrl: 'templates/base.html',
		controller: ['$location', '$scope', 'TagsFactory', 'FileFactory', 'Restangular', 'MessageFactory', 'ContentFactory', '$rootScope',
			function HomeController($location, $scope, TagsFactory, FileFactory, Restangular, MessageFactory, ContentFactory, root) {
				var self = this;
				self.newTagValue = "";
				self.attachment = "";
				self.message = "";
        self.allAttachments = [];
				self.messageDetails = {
					to: undefined,
					from: undefined,
					toName: undefined,
					fromName: undefined,
					attachments: [],
					tags: [],
					messageId: undefined
				};

				var queryParams = $location.search();

				root.$on('searchSelectEvent', function (event, data) {
		    		
		    		if(data.data.type == "MSG") {
						console.log("Here!");
						self.message = data.data.content.message_content;
					} else {
						if(self.allAttachments.indexOf(data.data.content) < 0) {
							self.allAttachments.push(data.data.content);
							self.messageDetails.attachments.push(data.data.content.id);
						}
					}
		    	});
        
				var flockEvent = JSON.parse(queryParams.flockEvent);
				console.log(flockEvent);

				self.messageDetails.from = flockEvent.userId; self.messageDetails.fromName = flockEvent.userName;
				self.messageDetails.to = flockEvent.chat; self.messageDetails.toName = flockEvent.chatName;
				root.userId = flockEvent.userId || 'u:v77sdynhzi74zy44';
        

				TagsFactory.get({'userId': root.userId}, function(data) {
					console.log(data);
					self.allTags = data;

				});

				self.submit = function() {
					var message = {
						'message': self.message,
						'userId': root.userId
					};
					MessageFactory.save(message, function(data) {
						self.messageDetails.messageId = data.id;
						console.log(self.messageDetails);
						var tags = self.messageDetails.tags.map(function(val) {return val.id});
						var cdata = {
							"to":  self.messageDetails.to,
							"userId": root.userId,
							"content_json": {
								"message": data.id,
								"attachments": self.messageDetails.attachments,
								"tags": tags
							}
						}
						ContentFactory.save(cdata, function(data) {
							console.log(data);
							flock.close();
						});
					});


					// form submit api end point
				};

				self.saveTag = function () {
					// on click event to save that tag in tags[] and update in db
					var tag = {
						'tag_value': self.newTagValue,
						'userId': root.userId
					};
					TagsFactory.save(tag, function (data) {
						self.messageDetails.tags.push(data);
						self.newTagValue = "";
						self.allTags.push(data);
						console.log(self.messageDetails.tags);
					});
				};

				self.uploadAttachment = function () {
					// on file select event to save file and append id in attachments[]
				};

				self.getTags = function () {
					// search for the tags
				};

				$scope.fileNameChanged = function () {

					var fd = new FormData();
        			fd.append('file_data', self.attachment);
        			fd.append('userId', root.userId);
					console.log(fd);
					Restangular.one('file/').withHttpConfig({transformRequest: angular.identity})
                    .customPOST(fd, '', undefined, {'Content-Type': undefined}).then(function(data) {
                    	self.messageDetails.attachments.push(data.id);
                      self.allAttachments.push(data);
                    });
				};
			}
		]

	});
