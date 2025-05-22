etrieve activities for a timeline

The timeline uses the activities API. This currently results in a resource ActivityResource . That resource should be slightly changed (with a breaking change):

ActivityResource {
    activity_at: DateString;
    time_at: TimeString;

    relationships: {
        source: Answer | Comment | Shareable | ...
        reactions: source->hasComments() -> Array<Comment>
        causer?: Account (name & avatar suffice)
    }
}
This makes the resource a lot easier to work with, as the frontend can simply retrieve the Activity.source() to get the actual thing to render. Next to that, by adding the causer of the activity, the frontend can render the basic structure of an activity in a standardized way, ie.

<SidebarModal>
{activityGroup.map((activity) => (
  const source = activity.source();
  <Activity 
    name={activity.causer().fullName} 
    avatar={activity.causer().avatarUrl}
    date={activity.date_at}
    timestamp={activity.time_at}
  >
    {
      'answers' => <ActivityAnswer answer={source} />
      'comments' => <ActivityComments comment={source} />
      'shareables' => <ActivityShareable shareable={source} />
      'assessments' => <Assessment 
                          type={source.type} 
                          value={source.value}  
                          result={source.result}
                          comment={source.comment}
                          name={activity.causer().fullName}
                          avatar={activity.causer().avatarUrl}
                        />
    }[activity.source().resourceType]
  </Activity>
)}
<SidebarModal>
API endpoint for activities

Currently, we use the EnrollmentLearningObjectActivityController to render the activity timeline. I would likie to make this a similar kind of controller as the TicketController . I think, that with the following endpoint, we can make 'activities' another multi-use-case controller:

/api/v1/activities
   ?filter[learning_object]=:learningObjectId   // Activities for assignment
   ?filter[learning_subject]=:learningSubjectId // Activities for quiz/subject
   ?filter[enrollment]=:enrollmentId         // Activities for an enrollment
   ?filter[causer]=:accountId                // Activities by a user
   ?filter[exposition]=:expositionId         // Activities of an exposition
   ?include=causer,source,reactions
The current QueryBuilder focuses on the Answer model and retrieves all kind of connections from there. Similar to the TicketController, this should not build a query around a single model, but multiple. Each possible 'source' should be its own scope and query builder.



This endpoint can then be used in the Activities timeline on an assignment as:

const [{data: activities}] = useActivities({ // new api hook
  filter: {
     learning_object: learningObjectId,
     enrollment: studentEnrollmentId,
  }
});
// GET /api/v1/activities
//        ?filter[learning_object]=:learningObjectId
//        &filter[enrollment]=:enrollmentId
This refactor enables however:

Easier addition of resources unrelated to Answer model

Show activities in other views, for example in the course view of a coach, showing all activity happening in that course.