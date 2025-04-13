import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  // MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"

import { Input } from "@/components/ui/input"



function SearchVisualizer() {
  return(
    <div className="p-3 h-screen">
      <Card className="h-full">
        <CardHeader className="flex">
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>Algorithm</MenubarTrigger>

              <MenubarContent>
                {/* <MenubarShortcut>⌘T</MenubarShortcut> */}
                <MenubarItem>Linear Search</MenubarItem>

                <MenubarSeparator />

                <MenubarItem>Binary search</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>

          <Input
            type="number"
            className="w-min"
            placeholder="Array size"
          />
        </CardHeader>
        <CardContent>
          <p>Search visualizer</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default SearchVisualizer