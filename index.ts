import fs from "fs";
import path from "path";

enum Command {
  CREATE = "CREATE",
  LIST = "LIST",
  DELETE = "DELETE",
  MOVE = "MOVE"
}

type TDirectory = {
  name: string;
  path: string;
  children: TDirectory[];
};

const readFile = (file = "input.txt") =>
  new Promise<string>((resolve, reject) => {
    fs.readFile(path.join(__dirname, file), (err, data) => {
      if (err) {
        reject(err);
        return null;
      }

      resolve(data.toString("utf8"));
    });
  });

export default class Filer {
  private directory: TDirectory[];
  private commands: string[];

  constructor() {
    this.directory = [];
    this.commands = [];
  }

  async runCommands() {
    const file = await readFile();
    const copy = () => file;

    copy()
      .split(/\r?\n/)
      .map(cmd => {
        const [c, ...args] = <[Command, string]>cmd.split(" ");
        this.runCommand(c, ...args);
      });
  }

  runCommand(command: Command, ...args: string[]) {
    switch (command) {
      case Command.CREATE:
        this.tryCreateDirectory(args[0]);
      case Command.DELETE:
        this.removeDirectory(args[0]);
      case Command.LIST:
        this.listDirectory();
      case Command.MOVE:
        this.moveDirectory(...args);
      default:
        console.log(command, ...args);
    }
  }

  tryCreateDirectory(name: string) {
    const dirs = name.split("/");
    const shouldFlat = (arr: TDirectory[], d: TDirectory) =>
      d.children
        ? [...d.children, [...d.children].reduce<TDirectory[]>(shouldFlat, [])]
        : arr;

    //brute force due to time... so this doesn't go very deep
    if (dirs.length === 3) {
      this.directory = [...this.directory].map(pDir => {
        if (pDir.name === dirs[0]) {
          pDir.children = [...pDir.children].map(ppDir => {
            if (ppDir.name === dirs[1]) {
              ppDir.children = [
                ...ppDir.children,
                this.createDirectory(dirs[2], `/${dirs[0]}/${dirs[1]}/`)
              ];
            }

            return ppDir;
          });
        }

        return pDir;
      });
    } else if (dirs.length >= 2) {
      this.directory = [...this.directory].map(dir =>
        dir.name === dirs[0]
          ? {
              ...dir,
              children: [
                ...dir.children,
                this.createDirectory(dirs[1], `/${dirs[0]}/`)
              ]
            }
          : dir
      );
    } else {
      this.directory = [...this.directory, this.createDirectory(name)];
    }

    console.log(this.directory);
  }

  createDirectory(name: string, prefix = "/"): TDirectory {
    const path = `${prefix}${name}`;

    return {
      name,
      path,
      children: []
    };
  }

  listDirectory(): void {
    const printDirectory = (dir: TDirectory) => {
      console.log(dir.path);
      if (dir.children) [...dir.children].map(printDirectory);
    };
    [...this.directory].map(printDirectory);
  }

  removeDirectory(name: string): void {
    // console.log("remove", name);
  }

  moveDirectory(...args: string[]): void {
    const [from, to] = args;
    // console.log("move", from, "to", to);
  }
}

const n = new Filer();
n.runCommands();
