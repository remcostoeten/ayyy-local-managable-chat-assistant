# Activity Feed V2 Implementation Plan

## Overview
This document outlines the implementation plan for the refreshed Activity Feed component that will display exposition-related activities between students and coaches. The component will be part of the "Expositions Sharing" feature.

## Code Style Requirements

### Type Conventions
- Single type: `TProps` (capital T + P)
- Multiple types: prefix with T (e.g., `TActivityData`, `TAssessmentStatus`)
- Types defined in same file unless file gets large

### Component Conventions
- Arrow functions ONLY - no React.FC syntax
- No className targeting - use single className prop
- CSS Modules with classNames.bind(styles) e.g. `{cx(styles.label)}`
- Classnames should be one word, no nested selectors.
- The first class of a stylehsheet should be `base`.

### API & Hooks
- API hooks follow existing patterns in codebase
- Hooks typically in same file as component unless large
- Mock API setup follows existing mock patterns

### Styling
- Single CSS words only - must be self-explanatory
- CSS variables from addVariables.css file
- No nested ternaries - use object mapping or getKeyWithTrue utility

## Implementation Sections

### Section 1: Types and Constants
Location: `src/Components/ActivityFeed/V2/types.ts`

#### Types to Create:
- TActivityData
- TAssessmentStatus
- TActivityType
- TActivitySource
- TActivityCauser
- TActivityReaction

 a#### Constants to Define:
- Assessment statuses
- Activity types
- Date format patterns

### Section 2: API Integration
Location: `src/Hooks/Activities`

#### Components:
- useActivities hook
- API response types
- Error handling utilities
- Loading state management

### Section 3: Assessment Status Component
Location: `src/Components/ActivityFeed/V2/components/AssessmentStatus`

#### Features:
- Status types support (O/V/G, binary, numeric)
- Status-based styling
- Feedback display
- Constructive language patterns

### Section 4: Activity Item Components
Location: `src/Components/ActivityFeed/V2/components`

#### Components:
1. ActivityItem (base)
2. ExpositionSubmission
3. Comment - Check if this is already implemented in the codebase e.g. `ActivityFeed`
4. Assessment
5. Reaction - Check if this is already implemented in the codebase e.g. `ActivityFeed`

#### Features:
- User avatar display (grab from the mock json api - have a fallback to the user's initials)
- Timestamp formatting (probably a existing utility)
- Status indicators
- Nested comments support

### Section 5: Activity Feed Container
Location: `src/Components/ActivityFeed/V2`

#### Features:
- Date grouping
- Activity sorting
- SidebarModal integration
- Pagination support

### Section 6: Integration and Polish
Location: Various

#### Tasks:
- Main exposition view integration
- Loading states
- Error handling
- Animations
- Accessibility
- Final testing

## Mock API Structure

### Endpoint
```
GET /api/v1/activities?filter[exposition]={id}&include=causer,source,reactions
```

### Response Structure
```typescript
{
  data: Array<{
    id: string;
    type: "activities";
    attributes: {
      activity_at: string;
      time_at: string;
      resource_type: string;
    };
    relationships: {
      source: {
        data: {
          id: string;
          type: string;
          attributes: Record<string, any>;
        };
      };
      causer: {
        data: {
          id: string;
          type: "accounts";
          attributes: {
            full_name: string;
            avatar_url: string;
          };
        };
      };
      reactions: {
        data: Array<{
          id: string;
          type: "comments";
          attributes: {
            body: string;
            created_at: string;
          };
        }>;
      };
    };
  }>;
  meta: {
    pagination: {
      total: number;
      count: number;
      per_page: number;
      current_page: number;
      total_pages: number;
    };
  };
}
```

## Visual Requirements

### Assessment Status Colors
- Approved: Green background use `var(--success-color)`
- Returned: Yellow background (replacing "rejected" terminology) use `var(--warning-color)`
- Default: Neutral background use `var(--grey-color-10)`

### Activity Grouping
- Group by date
- Chronological order within groups
- Clear date separators

### User Interface Elements
- User avatars
- Timestamps
- Status indicators
- Nested comments
- Reply buttons

## Future Extensions
The implementation should consider future additions:
- Chat functionality
- Additional activity types
- More complex interaction patterns

## Development Process
1. Start with static implementation
2. Add API integration
3. Implement interactivity
4. Add animations and polish
5. Test thoroughly
6. Document usage

## Notes
- Reuse existing components where possible
- Follow established patterns
- Maintain consistent styling
- Ensure accessibility
- Write clean, maintainable code 