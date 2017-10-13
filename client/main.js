//Essential for the roles package to initialise and check if the user is in roles for real 

FlowRouter.wait();

Tracker.autorun(() => {
  if (Roles.subscription.ready() && !FlowRouter._initialized) {
    FlowRouter.initialize();
  }
});
