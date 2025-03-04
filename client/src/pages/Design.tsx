import { useEffect, useRef, useState, useCallback, JSX } from 'react';
import { useParams } from 'react-router-dom';
import { svg2pdf } from 'svg2pdf.js';
import jsPDF from 'jspdf';
import useStore from '../store/useStore';
import { ActionBar, SideMenu, View } from '../features/design';

interface Offset {
    x: number;
    y: number;
}

const Design = (): JSX.Element => {
    const { id } = useParams();
    const { fetchProject, selectionBox } = useStore();
    const designRef = useRef<SVGSVGElement | null>(null);
    const [zoom, setZoom] = useState<number>(1);
    const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });

    useEffect(() => {
        if (id) {
            fetchProject(id);
        }
    }, [id, fetchProject]);

    const generatePDF = useCallback(async (fileName: string): Promise<void> => {
        const svgElement = designRef.current;
        if (!svgElement) {
            console.error('SVG element not found');
            return;
        }

        const clonedSvgElement = svgElement.cloneNode(true) as SVGSVGElement;
        const viewBoxWidth = svgElement.viewBox.baseVal.width;
        let aspectRatio = 1;

        if (selectionBox) {
            const { startX, startY, endX, endY } = selectionBox;
            const svgWidth = svgElement.clientWidth;
            const svgHeight = svgElement.clientHeight;
            const viewBoxHeight = svgElement.viewBox.baseVal.height;

            const zoomFactor = (val: number, axisLength: number, viewBoxLength: number): number =>
                (val * (viewBoxLength / axisLength));

            const adjustAxis = (val: number, axisLength: number, viewBoxLength: number): number =>
                zoom === 1 ? val : val - ((viewBoxLength - (viewBoxLength * zoom)) / 2);

            const selectionX = zoomFactor(adjustAxis(Math.min(startX, endX), svgWidth, viewBoxWidth), svgWidth, viewBoxWidth);
            const selectionY = zoomFactor(adjustAxis(Math.min(startY, endY), svgHeight, viewBoxHeight), svgHeight, viewBoxHeight);
            const selectionWidth = zoomFactor(Math.abs(endX - startX), svgWidth, viewBoxWidth);
            const selectionHeight = zoomFactor(Math.abs(endY - startY), svgHeight, viewBoxHeight);
            aspectRatio = selectionWidth / selectionHeight;

            clonedSvgElement.setAttribute('viewBox', `${selectionX} ${selectionY} ${selectionWidth} ${selectionHeight}`);
        } else {
            clonedSvgElement.setAttribute(
                'viewBox',
                `${(((viewBoxWidth - 520) / 2) + offset.x) * zoom} ${(offset.y) * zoom} ${520 * zoom} ${window.innerHeight * zoom}`
            );
        }

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const renderSize = (val: number, aspectRatio: number): [number, number] =>
            aspectRatio > 1 ? [val, val / aspectRatio] : [val * aspectRatio, val];
        const [renderWidth, renderHeight] = renderSize(pdfWidth, aspectRatio);

        const x = (pdfWidth - renderWidth) / 2;
        const y = (pdfHeight - renderHeight) / 2;

        console.log(clonedSvgElement);

        try {
            await svg2pdf(clonedSvgElement, pdf, { x, y, width: renderWidth, height: renderHeight });
            pdf.save(`${fileName}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    }, [selectionBox, zoom, offset]);

    return (
        <main className="h-screen fixed w-screen">
            <SideMenu />
            <ActionBar generatePDF={generatePDF} />
            <View
                generatePDF={generatePDF}
                zoom={zoom}
                setZoom={setZoom}
                offset={offset}
                setOffset={setOffset}
                reference={designRef}
                selectionBox={selectionBox}
            />
        </main>
    );
};

export default Design;