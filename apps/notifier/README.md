# Astro Notifier App

Astro Notifier App is responsible for sending notifications using [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging).

Notifications are triggered during aggregation flow.

Currently App has next notifications:

- Notify subscribers about DAO updates.
- Notify DAO counselors about DAO updates.
  
To subscribe for DAO updates user has to call `POST /api/v1/subscriptions` endpoint.

To unsubscribe from DAO updates user has to call `DELETE /api/v1/subscriptions/{id}` endpoint.