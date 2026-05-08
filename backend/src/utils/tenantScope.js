export function getTargetUserId(req) {
  if (req.user.role === "admin") {
    return req.body.user_id || req.query.user_id || req.params.user_id || req.user.id;
  }
  return req.user.id;
}

export function getReadScope(req, column = "user_id") {
  if (req.user.role === "admin") {
    const selectedUserId = req.query.user_id;
    if (!selectedUserId) {
      return { clause: "", values: [] };
    }
    return { clause: ` WHERE ${column} = $1`, values: [selectedUserId] };
  }
  return { clause: ` WHERE ${column} = $1`, values: [req.user.id] };
}
