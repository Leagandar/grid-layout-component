/* eslint-env jest */

import React from "react";
import _ from "lodash";
import TestUtils from "react-dom/test-utils";
import GridLayout from "../../lib/GridLayout";
import GridItem from "../../lib/GridLayoutElement";
// import BasicLayout from "../examples/1-basic";
import ShowcaseLayout from "../examples/0-showcase";
// import DroppableLayout from "../examples/15-drag-from-outside";
import { mount } from "enzyme";

describe("Lifecycle tests", function () {
  // Example layouts use randomness
  let randIdx = 0;
  beforeAll(() => {
    const randArr = [0.001, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.999];
    jest.spyOn(global.Math, "random").mockImplementation(() => {
      randIdx = (randIdx + 1) % randArr.length;
      return randArr[randIdx];
    });
  });

  beforeEach(() => {
    randIdx = 0;
  });

  afterAll(() => {
    global.Math.random.mockRestore();
  });

  describe("<GridItem >", () => {
    const mockProps = {
      children: <div>test child</div>,
      cols: 12,
      containerWidth: 1200,
      rowHeight: 300,
      margin: [0, 0],
      maxRows: 4,
      containerPadding: [0, 0],
      i: "0",
      // These are all in grid units
      x: 0,
      y: 0,
      w: 100,
      h: 100,
      drag: false,
      resizable: false,
      isBounded: false
    };
    it("Basic Render", () => {
      const wrapper = mount(<GridItem {...mockProps} />);
      expect(wrapper).toMatchSnapshot();
    });

    describe("optional min/max dimension props log err", () => {
      describe("minW", () => {
        const mockError = jest.spyOn(console, "error");
        afterEach(() => {
          jest.clearAllMocks();
        });

        it("2x when string, not number", () => {
          // $FlowIgnore
          mount(<GridItem {...mockProps} minW={"apple"} />);
          expect(mockError).toHaveBeenCalledTimes(2);
        });
        it("1 err when larger than w prop", () => {
          mount(<GridItem {...mockProps} minW={400} />);
          expect(mockError).toHaveBeenCalledTimes(1);
        });
      });

      describe("maxW", () => {
        const mockError = jest.spyOn(console, "error");
        afterEach(() => {
          jest.clearAllMocks();
        });

        it("1x when string, not number", () => {
          // $FlowIgnore
          mount(<GridItem {...mockProps} maxW={"apple"} />);
          expect(mockError).toHaveBeenCalledTimes(1);
        });
        it("1x err when smaller than w prop", () => {
          mount(<GridItem {...mockProps} w={4} maxW={2} />);
          expect(mockError).toHaveBeenCalledTimes(1);
        });
      });

      describe("minH", () => {
        const mockError = jest.spyOn(console, "error");
        afterEach(() => {
          jest.clearAllMocks();
        });

        it("2x when string, not number", () => {
          // $FlowIgnore
          mount(<GridItem {...mockProps} minH={"apple"} />);
          expect(mockError).toHaveBeenCalledTimes(2);
        });
        it("1x when larger than h prop", () => {
          mount(<GridItem {...mockProps} minH={200} />);
          expect(mockError).toHaveBeenCalledTimes(1);
        });
      });

      describe("maxH", () => {
        const mockError = jest.spyOn(console, "error");
        afterEach(() => {
          jest.clearAllMocks();
        });

        it("1x when string, not number", () => {
          // $FlowIgnore
          mount(<GridItem {...mockProps} maxH={"apple"} />);
          expect(mockError).toHaveBeenCalledTimes(1);
        });
        it("1x when smaller than h prop", () => {
          mount(<GridItem {...mockProps} h={3} maxH={2} />);
          expect(mockError).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe("onDrag", () => {
      it("calls onDragStart prop when droppingPosition prop has expected content", () => {
        const mockFn = jest.fn();

        mount(
          <GridItem
            {...mockProps}
            // $FlowIgnore
            droppingPosition={{ left: 1, top: 1, e: {} }}
            onDragStart={mockFn}
          />
        );
        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      it("throws err when calling onDrag without state set to dragging ", () => {
        const componentInstance = mount(
          <GridItem {...mockProps} onDrag={() => {}} />
        ).instance();

        expect(() => {
          // $FlowIgnore
          componentInstance.onDrag({}, {});
        }).toThrow("onDrag called before onDragStart.");
      });

      it("calls onDragStart prop callback fn", () => {
        const mockFn = jest.fn();

        const componentInstance = mount(
          <GridItem
            {...mockProps}
            // $FlowIgnore
            droppingPosition={{ left: 1, top: 1, e: {} }}
            onDragStart={mockFn}
          />
        ).instance();
        // $FlowIgnore
        componentInstance.onDrag({}, () => {});
        expect(mockFn).toHaveBeenCalledTimes(1);
      });

      it("calls onDrag prop callback fn", () => {
        const mockOnDragStartCallback = jest.fn();
        const mockOnDrag = jest.fn();
        const renderedItem = mount(
          <GridItem
            {...mockProps}
            // $FlowIgnore
            drag={true}
            isBounded={true}
            onDragStart={mockOnDragStartCallback}
            onDrag={mockOnDrag}
          />
        );
        TestUtils.act(() => {
          renderedItem.setState({ dragging: true });
          renderedItem.setProps({
            droppingPosition: { left: 700, top: 300, e: {} }
          });
        });
        expect(mockOnDrag).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("<ReactGridLayout>", function () {
    it("Basic Render", async function () {
      const wrapper = mount(<BasicLayout />);
      expect(wrapper).toMatchSnapshot();
    });

    describe("WidthProvider", () => {
      it("Renders with WidthProvider", async function () {
        const wrapper = mount(<BasicLayout measureBeforeMount={false} />);
        expect(wrapper).toMatchSnapshot();

        const widthProviderWrapper = wrapper.childAt(0);
        expect(widthProviderWrapper.name()).toEqual("WidthProvider");
        expect(widthProviderWrapper.childAt(0).name()).toEqual(
          "ReactGridLayout"
        );

        expect(widthProviderWrapper.state().width).toEqual(1280); // default
      });

      it("Renders with WidthProvider measureBeforeMount", async function () {
        const wrapper = mount(<BasicLayout measureBeforeMount={true} />);
        expect(wrapper).toMatchSnapshot();

        const widthProviderWrapper = wrapper.childAt(0);
        expect(widthProviderWrapper.name()).toEqual("WidthProvider");
        // Renders a div first
        expect(widthProviderWrapper.childAt(0).name()).toEqual("div");

        // Mock offsetWidth to return 500 and fire a resize
        const node = wrapper.getDOMNode();
        Object.defineProperty(node, "offsetWidth", {
          get: jest.fn(() => 500)
        });
        global.dispatchEvent(new Event("resize"));

        wrapper.setProps({}); // force a rerender synchronously

        // Should have removed the div, now has the RGL
        expect(wrapper.childAt(0).childAt(0).name()).toEqual("ReactGridLayout");
        expect(wrapper.childAt(0).state().width).toEqual(500);
      });

      it("WidthProvider responds to window resize events", async function () {
        const wrapper = mount(<BasicLayout />);
        const widthProviderWrapper = wrapper.childAt(0);

        // Original width
        expect(widthProviderWrapper.state().width).toEqual(1280);

        // Mock offsetWidth to return 500
        const node = wrapper.getDOMNode();
        Object.defineProperty(node, "offsetWidth", {
          get: jest.fn(() => 500)
        });

        // Trigger the window resize event.
        global.dispatchEvent(new Event("resize"));

        // State should now be 500
        expect(widthProviderWrapper.state().width).toEqual(500);
      });
    });

    describe("Droppability", function () {
      function dragDroppableTo(wrapper, x, y) {
        const gridLayout = wrapper.find("ReactGridLayout");
        const droppable = wrapper.find(".droppable-element");

        TestUtils.Simulate.dragOver(gridLayout.getDOMNode(), {
          nativeEvent: {
            target: droppable.getDOMNode(),
            layerX: x,
            layerY: y
          }
        });
      }
      it("Updates when an item is dropped in", function () {
        const wrapper = mount(<DroppableLayout containerPadding={[0, 0]} />);
        const gridLayout = wrapper.find("ReactGridLayout");
        expect(gridLayout).toHaveLength(1);

        // Start: no dropping node.
        expect(gridLayout.state("droppingDOMNode")).toEqual(null);

        // Drag the droppable over the grid layout.
        dragDroppableTo(wrapper, 200, 150);

        // We should have the position in our state.
        expect(gridLayout.state("droppingPosition")).toHaveProperty(
          "left",
          200
        );
        expect(gridLayout.state("droppingPosition")).toHaveProperty("top", 150);
        // We should now have the placeholder element in our state.
        expect(gridLayout.state("droppingDOMNode")).toHaveProperty(
          "type",
          "div"
        );
        expect(gridLayout.state("droppingDOMNode")).toHaveProperty(
          "key",
          "__dropping-elem__"
        );

        // It should also have a layout item assigned to it.
        let layoutItem = gridLayout
          .state("layout")
          .find((item) => item.i === "__dropping-elem__");
        expect(layoutItem).toEqual({
          i: "__dropping-elem__",
          h: 1,
          w: 1,
          x: 2,
          y: 4,
          static: false,
          drag: true
        });

        // Let's move it some more.
        dragDroppableTo(wrapper, 0, 300);

        // State should change.
        expect(gridLayout.state("droppingPosition")).toHaveProperty("left", 0);
        expect(gridLayout.state("droppingPosition")).toHaveProperty("top", 300);

        layoutItem = gridLayout
          .state("layout")
          .find((item) => item.i === "__dropping-elem__");
        // Using toMatchObject() here as this will inherit some undefined properties from the cloning
        expect(layoutItem).toMatchObject({
          i: "__dropping-elem__",
          h: 1,
          w: 1,
          x: 0,
          y: 10,
          static: false,
          drag: true
        });
      });

      it("Allows customizing the droppable placeholder", function () {
        const wrapper = mount(
          <DroppableLayout onDropDragOver={() => ({ w: 2, h: 2 })} />
        );
        const gridLayout = wrapper.find("ReactGridLayout");

        // Find the droppable element and drag it over the grid layout.
        dragDroppableTo(wrapper, 200, 150);

        // It should also have a layout item assigned to it.
        const layoutItem = gridLayout
          .state("layout")
          .find((item) => item.i === "__dropping-elem__");
        expect(layoutItem).toEqual({
          i: "__dropping-elem__",
          h: 2,
          w: 2,
          x: 2,
          y: 4,
          static: false,
          drag: true
        });
      });

      it("Allows short-circuiting the drag", function () {
        const wrapper = mount(<DroppableLayout onDropDragOver={() => false} />);
        const gridLayout = wrapper.find("ReactGridLayout");

        // Find the droppable element and drag it over the grid layout.
        dragDroppableTo(wrapper, 200, 150);

        // It should also have a layout item assigned to it.
        const layoutItem = gridLayout
          .state("layout")
          .find((item) => item.i === "__dropping-elem__");
        expect(layoutItem).toBeUndefined();
      });
    });
  });
});
