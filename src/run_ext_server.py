""" Run External Server

Do not use in production!
See http://flask.pocoo.org/docs/0.11/deploying/#deployment

"""
from app import flask_app, db
from config import ExtConfig

if __name__ == "__main__":
    flask_app.config.from_object(ExtConfig)

    if flask_app.config.get("BEFORE_RUN_UPDATE_COURSES"):
        db.catalog.courses.update_db()
        print "catalog > courses has been updated"
    if flask_app.config.get("BEFORE_RUN_UPDATE_DEGREES"):
        db.catalog.degrees.update_db()
        print "catalog > degrees has been updated"
    if flask_app.config.get("BEFORE_RUN_UPDATE_SCHEDULE"):
        db.schedule.update_db()
        print "schedule semesters have been updated"

    # IMPORTANT: DEBUG MUST NEVER BE TRUE ON EXTERNALLY VISIBLE SERVERS!
    flask_app.run(host='0.0.0.0', port=80, threaded=True, debug=False)
