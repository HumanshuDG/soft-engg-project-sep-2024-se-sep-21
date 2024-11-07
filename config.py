class Config(object):
    DEBUG = False
    TESTING = False
    #CACHE_TYPE = "RedisCache"
    #CACHE_DEFAULT_TIMEOUT = 300

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///database.db'
    SECRET_KEY = "thisissecret" 
    SECURITY_PASSWORD_SALT = "thisissalt"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    WTF_CSRF_ENABLED = False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authentication-Token'
    HF_API_KEY = "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"  # Store your Hugging Face API key here securely
