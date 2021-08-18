export enum DaoStatus {
  // Dao entity created - waiting for approval
  Pending = 'Pending',
  // Dao has been successfully created.
  Success = 'Success',
  // Dao creation transaction has been rejected.
  Reject = 'Reject',
}
