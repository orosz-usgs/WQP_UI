from flask.ext.collect import Collect
from flask.ext.script import Manager, Command

from portal_ui import app


class CollectStaticFiles(Command):
    """
    collects static files
    so Apache can serve them
    """ 
    
    def run(self):
        collect = Collect()
        collect.init_app(app)
        collect.init_script(manager)
        collect.collect(verbose=True)
        
if __name__ == "__main__":
    manager = Manager(app)

    manager.add_command('collect', CollectStaticFiles())
    manager.run()