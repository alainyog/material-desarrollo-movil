define([
  "containers/tabcontainer",
  "containers/stackcontainer",
  "containers/simplescrollcontainer",
  "containers/inertialscrollcontainer",
  "containers/listcontainer",
], function(TabContainer, StackContainer, SimpleScrollContainer, InertialScrollContainer, ListContainer) {
  "use strict";
  return {
    TabContainer: TabContainer,
    StackContainer: StackContainer,
    SimpleScrollContainer: SimpleScrollContainer,
    InertialScrollContainer: InertialScrollContainer,
    ListContainer: ListContainer,
  };
});
