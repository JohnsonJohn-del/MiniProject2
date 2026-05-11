export function getTargetUserId(req) {
  if (req.user.role === "admin") {
    return req.body.user_id || req.query.user_id || req.params.user_id || req.user.id;
  }
  return req.user.id;
}
