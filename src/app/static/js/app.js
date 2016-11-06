//inheriting ngMaterial from Google, and overlay.js
$(document).ready(function () {
    // page is now ready, initialize the calendar..
    console.log("Calenderloaded");
    $('#calendar').fullCalendar({
        // put your options and callbacks here
        defaultView: 'agendaWeek',
        weekends: false,
        minTime: '08:00:00',
        maxTime: '21:00:00',
        header: {
            left: false,
            center: false,
            right: false,
        },
        height: "parent",
    })
});

(function () {
    'use strict';

    angular.module('scheduler', ['ngMaterial', 'ngDialog'])
        .controller('cTabModule', cTabModule)
        .controller('cToggleNavigation', cToggleNavigation)
        .controller('cSideCtrl', cSideCtrl)
        .directive('tabNavigation', tabNavigation);

    //tab module for optimal class selections
    function cTabModule($scope, $log) {
        var tabs = [
                { title: 'One', content: "Tabs will become paginated if there isn't enough room for them." },
                { title: 'Two', content: "You can swipe left and right on a mobile device to change tabs." },
                { title: 'Three', content: "You can bind the selected tab via the selected attribute on the md-tabs element." },
                { title: 'Four', content: "If you set the selected tab binding to -1, it will leave no tab selected." },
                { title: 'Five', content: "If you remove a tab, it will try to select a new one." },
                { title: 'Six', content: "There's an ink bar that follows the selected tab, you can turn it off if you want." },
                { title: 'Seven', content: "If you set ng-disabled on a tab, it becomes unselectable. If the currently selected tab becomes disabled, it will try to select the next tab." },
                { title: 'Eight', content: "If you look at the source, you're using tabs to look at a demo for tabs. Recursion!" },
                { title: 'Nine', content: "If you set md-theme=\"green\" on the md-tabs element, you'll get green tabs." },
                { title: 'Ten', content: "If you're still reading this, you should just go check out the API docs for tabs!" }
        ],
            selected = null,
            previous = null;

        $scope.tabs = tabs;
        $scope.selectedIndex = 0;
        $scope.$watch('selectedIndex', function (current, old) {
            previous = selected;
            selected = tabs[current];
            if (old + 1 && (old != current)) $log.debug('Goodbye ' + previous.title + '!');
            if (current + 1) $log.debug('Hello ' + selected.title + '!');
        });
        $scope.addTab = function (title, view) {
            view = view || title + " Content View";
            tabs.push({ title: title, content: view, disabled: false });
        };
        $scope.removeTab = function (tab) {
            var index = tabs.indexOf(tab);
            tabs.splice(index, 1);
        };
    }

    //Toggles side Navigation bar on and off
    function cToggleNavigation($scope, $mdSidenav, $log) {
        $scope.toggleLeft = buildToggler('left');

        $scope.toggleLeft = function () {
            return $mdSidenav('left').toggle();
        };

        $scope.isSidebarOpen = function () {
            return $mdSidenav('left').isOpen();
        };

        function buildToggler(componentId) {
            return function () {
                $mdSidenav(componentId).toggle();
            }
        }

        $scope.close = function () {
            // Component lookup should always be available since we are not using `ng-if`
            $mdSidenav('left').close()
                .then(function () {
                    $log.debug("close LEFT is done");
                });
        };
    }

    //Side control options Scheduler/Courses
    function cSideCtrl($scope, $log, ngDialog) {
        var self = this;
        self.nav = 'course_info';
        self.searchTimeout = false;

        self.selectedItemChange = function (text) {
            //$log.info('Text changed to ' + text);
        };

        self.searchTextChange = function (item) {
            //$log.info('Item changed to ' + JSON.stringify(item));
        };

        self.setNav = function (page) {
            console.log("nav = " + page);
            self.nav = page;
        };

        self.getNav = function () {
            return self.nav;
        };

        self.searchTree = function (searchString) {
            if (self.searchTimeout) {
                clearTimeout(self.searchTimeout);
            }
            self.searchTimeout = setTimeout(function () {
                $('#course_tree').jstree('search', searchString);
                //$('#course_tree').jstree(true).search(searchString);
            }, 300);
        };


        $('#course_tree')
			.on('changed.jstree', function (e, data) {
			    var i, j, r = [];
			    for (i = 0, j = data.selected.length; i < j; i++) {
			        console.log('Pushing: ' + data.instance.get_node(data.selected[i]).text);
			        r.push(data.instance.get_node(data.selected[i]).text);
			    }
			    console.log('Selected: ' + r.join(', '));
			    var dialog = ngDialog.open({
			        className: 'ngdialog-theme-default',
			        template: '<p>Course Info:</p><div>' + data.node.text + '</div>',
			        plain: true,
			        showClose: false,
			        closeByDocument: true,
			        closeByEscape: true,
			        appendTo: false,
			    });
			})
			.jstree({
			    'core': {
			        'data': function (obj, cb) {
			            $.get("/api/courses/tree", function (data) {
			                cb.call(this, data.results);
			            });
			        }
			    },
			    "search": {
			        "case_insensitive": true,
			        "show_only_matches": true,
			        "multiple": false
			    },
			    "plugins": ["search"]
			});

			
        $('#schedule_tree')
			.on('changed.jstree', function (e, data) {
			    var i, j, r = [];
			    for (i = 0, j = data.selected.length; i < j; i++) {
			        console.log('Pushing: ' + data.instance.get_node(data.selected[i]).text);
			        r.push(data.instance.get_node(data.selected[i]).text);
			    }
			    console.log('Selected: ' + r.join(', '));
			})
			.jstree({
			    'core': {
			        'data': function (obj, cb) {
			            $.get("/api/schedule/tree", function (data) {
			                cb.call(this, data.results);
			            });
			        }
			    },
			    "search": {
			        "case_insensitive": true,
			        "show_only_matches": true,
			        "multiple": false
			    },
			    "checkbox": {
			        "keep_selected_style": false
			    },
			    "plugins": ["search", "checkbox"]
			});
        /**
         * Create filter function for a query string
         */
        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);

            return function filterFn(item) {
                return (item.value.indexOf(lowercaseQuery) === 0) ||
                    (item.name.toLowerCase().indexOf(lowercaseQuery) === 0);
            };
        }
    }

    //Angular Element Directives
    function tabNavigation($log) {
        $log.info("tabNavigationFunction");
        return {
            restrict: 'E',
            templateUrl: 'static/html/tabNavigation.html'
        };
    }

})();