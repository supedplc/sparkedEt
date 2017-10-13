import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import {
  _Sections,
  _Resources,
  _Statistics,
  _SearchData,
  _Topics,
  _Units,
  _Egranary,
  _Deleted,
  _Feedback,
  _Notifications,
  _School,
  _Programs,
  _Courses,
  _Institution
} from '../Collections/collections';




Meteor.users.allow({
  remove:function(){
    return true;
  },
  update:function(){
    return true;
  }
});

_Resources.allow({
  insert: function(){
    return true;
  },
  update: function(){
    return true;
  },
  remove: function(){
    return true;
  }

});

_Institution.allow({
  insert: function(){
    return true;
  },
  update: function(){
    return true;
  },
  remove: function(){
    return true;
  }
});

_SearchData.allow({
  insert: function(){
    return true;
  },
  update: function(){
    return true;
  },
  remove: function(){
    return true;
  }
});
_Deleted.allow({
  insert: function(){
    return true;
  },
  update: function(){
    return true;
  },
  remove: function(){
    return true;
  }
});
