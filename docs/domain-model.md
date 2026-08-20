# Domain Model

## Primary entities

### Profile
Application profile associated with an authenticated identity. Contains public/customer-operational fields, not authentication secrets.

### Game
A sellable game container with slug, presentation content, visibility, and lifecycle status.

### Service
A product offering belonging to a game, such as Rank Boost, Wins, Placements, or Coaching.

### Service Field
A configurable input required by a service. Examples include current rank, target rank, server, queue, priority, or coaching duration.

Fields need a type, validation rules, allowed values, display order, and visibility conditions.

### Service Field Option
An allowed choice for select-like service fields. Options must be data-backed instead of embedded in frontend components.

### Pricing Rule Set
A versioned collection of pricing rules associated with a service. Only one active rule set should be used for new quotes at a given time.

### Pricing Rule
A condition plus a pricing operation. Possible operations include fixed additions, multipliers, percentage adjustments, and lookup-based amounts.

### Quote
A short-lived server-generated pricing result for one service configuration. A quote records the selected configuration, calculated amount, currency, pricing rule-set version, and expiration.

### Promotion
A controlled discount or offer with eligibility, validity dates, usage limits, and calculation behavior.

### Order
The commercial transaction record owned by a customer. Contains lifecycle status, payment state, totals, customer references, and immutable snapshots needed for auditability.

### Order Item
A service purchase inside an order. Stores the purchased game/service identity, configuration snapshot, pricing snapshot, and fulfillment state.

### Payment
A record linking an order to Stripe objects and normalized payment status. Sensitive payment details are never stored directly.

### Order Message
A message attached to an order between the customer and authorized staff. This can be introduced after the basic order lifecycle is stable.

### Review
A post-fulfillment rating/review associated with an eligible completed order item. This is not required for the MVP.

## Supporting entities likely needed later

- `order_status_history`
- `promotion_redemptions`
- `content_blocks`
- `audit_log`
- `service_availability_rules`
- `notification_preferences`
- `notifications`

## Important invariants

- A service cannot be purchased when it is inactive.
- A selected configuration must be valid for the service definition at quote time and checkout time.
- An order total is never trusted from the client.
- Historical order pricing must remain explainable after current pricing rules change.
- Payment completion is confirmed from trusted Stripe server events.
- Customers can only read their own private order data.
- Admin permissions are never inferred solely from client state.
