import { useRef, useState, useCallback, JSX, useEffect } from 'react';
import { svg2pdf } from 'svg2pdf.js';
import jsPDF from 'jspdf';
import useAppStore from '../store/useAppStore';
import SideMenu from '@/features/side-menu';
import ActionBar from '@/features/editor';
import View from '@/features/canvas';

interface Offset {
    x: number;
    y: number;
}

const ContentWrapper = (): JSX.Element => {
    const { selectionBox, rotation } = useAppStore();
    const designRef = useRef<SVGSVGElement | null>(null);
    const [zoom, setZoom] = useState<number>(1);
    const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
    const [dimensions, setDimensions] = useState({
        width: 0,
        height: 0
    })

    // const generatePDF = useCallback(async (fileName: string): Promise<void> => {
    //     const svgElement = designRef.current;
    //     if (!svgElement) {
    //         console.error('SVG element not found');
    //         return;
    //     }

    //     const clonedSvgElement = svgElement.cloneNode(true) as SVGSVGElement;
    //     const viewBoxWidth = svgElement.viewBox.baseVal.width;
    //     let aspectRatio = 1;

    //     if (selectionBox) {
    //         const { startX, startY, endX, endY } = selectionBox;
    //         const svgWidth = svgElement.clientWidth;
    //         const svgHeight = svgElement.clientHeight;
    //         const viewBoxHeight = svgElement.viewBox.baseVal.height;

    //         const zoomFactor = (val: number, axisLength: number, viewBoxLength: number): number =>
    //             (val * (viewBoxLength / axisLength));

    //         const adjustAxis = (val: number, axisLength: number, viewBoxLength: number): number =>
    //             zoom === 1 ? val : val - ((viewBoxLength - (viewBoxLength * zoom)) / 2);

    //         const selectionX = zoomFactor(adjustAxis(Math.min(startX, endX), svgWidth, viewBoxWidth), svgWidth, viewBoxWidth);
    //         const selectionY = zoomFactor(adjustAxis(Math.min(startY, endY), svgHeight, viewBoxHeight), svgHeight, viewBoxHeight);
    //         const selectionWidth = zoomFactor(Math.abs(endX - startX), svgWidth, viewBoxWidth);
    //         const selectionHeight = zoomFactor(Math.abs(endY - startY), svgHeight, viewBoxHeight);
    //         aspectRatio = selectionWidth / selectionHeight;

    //         clonedSvgElement.setAttribute('viewBox', `${selectionX} ${selectionY} ${selectionWidth} ${selectionHeight}`);
    //     } else {
    //         clonedSvgElement.setAttribute(
    //             'viewBox',
    //             `${(((viewBoxWidth - 520) / 2) + offset.x) * zoom} ${(offset.y) * zoom} ${520 * zoom} ${window.innerHeight * zoom}`
    //         );
    //     }

    //     const pdf = new jsPDF('p', 'mm', 'a4');
    //     const pdfWidth = pdf.internal.pageSize.getWidth();
    //     const pdfHeight = pdf.internal.pageSize.getHeight();

    //     const renderSize = (val: number, aspectRatio: number): [number, number] =>
    //         aspectRatio > 1 ? [val, val / aspectRatio] : [val * aspectRatio, val];
    //     const [renderWidth, renderHeight] = renderSize(pdfWidth, aspectRatio);

    //     const x = (pdfWidth - renderWidth) / 2;
    //     const y = (pdfHeight - renderHeight) / 2;

    //     try {
    //         await svg2pdf(clonedSvgElement, pdf, { x, y, width: renderWidth, height: renderHeight });
    //         pdf.save(`${fileName}.pdf`);
    //     } catch (error) {
    //         console.error('Error generating PDF:', error);
    //     }
    // }, [selectionBox, zoom, offset]);

    // const generatePDFWithSelection = useCallback(async (fileName: string): Promise<void> => {
    //     if (!selectionBox) {
    //         console.log('No selection box present - PDF generation skipped');
    //         return;
    //     }

    //     const svgElement = designRef.current;
    //     if (!svgElement) {
    //         console.error('SVG element not found');
    //         return;
    //     }

    //     // Get SVG dimensions from viewBox
    //     const viewBox = svgElement.viewBox.baseVal;
    //     const svgWidth = viewBox.width;
    //     const svgHeight = viewBox.height;

    //     // Get the displayed size of the SVG
    //     const svgRect = svgElement.getBoundingClientRect();

    //     // Calculate scale factors between screen pixels and SVG units
    //     const scaleX = svgWidth / svgRect.width;
    //     const scaleY = svgHeight / svgRect.height;

    //     // Extract selection in screen coordinates
    //     const { startX, startY, endX, endY } = selectionBox;

    //     // Calculate selection width and height in screen space
    //     const selectionScreenWidth = Math.abs(endX - startX);
    //     const selectionScreenHeight = Math.abs(endY - startY);

    //     // Get top-left corner in screen space
    //     const screenLeft = Math.min(startX, endX);
    //     const screenTop = Math.min(startY, endY);

    //     // Transform selection to SVG space, accounting for zoom and offset
    //     // First, calculate coordinates relative to the SVG's displayed position
    //     const relativeLeft = screenLeft - svgRect.left;
    //     const relativeTop = screenTop - svgRect.top;

    //     // Now convert to SVG units, accounting for zoom
    //     const svgLeft = (relativeLeft * scaleX) / zoom;
    //     const svgTop = (relativeTop * scaleY) / zoom;
    //     const svgSelectionWidth = (selectionScreenWidth * scaleX) / zoom;
    //     const svgSelectionHeight = (selectionScreenHeight * scaleY) / zoom;

    //     // Adjust for offset (panning)
    //     const adjustedLeft = svgLeft + viewBox.x + (offset.x * svgWidth);
    //     const adjustedTop = svgTop + viewBox.y + (offset.y * svgHeight);

    //     // Create a new SVG for the selection
    //     const selectionSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    //     // Determine the dimensions and viewBox based on rotation
    //     const isRotated90or270 = rotation === 90 || rotation === 270;

    //     // Set the appropriate viewBox for the selection
    //     selectionSvg.setAttribute('viewBox',
    //         `${adjustedLeft} ${adjustedTop} ${svgSelectionWidth} ${svgSelectionHeight}`);

    //     // Set width and height attributes for the SVG
    //     if (isRotated90or270) {
    //         selectionSvg.setAttribute('width', `${svgSelectionHeight}`);
    //         selectionSvg.setAttribute('height', `${svgSelectionWidth}`);
    //     } else {
    //         selectionSvg.setAttribute('width', `${svgSelectionWidth}`);
    //         selectionSvg.setAttribute('height', `${svgSelectionHeight}`);
    //     }

    //     // Create a group for the content
    //     const contentGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    //     // Clone the original SVG content
    //     const originalContent = svgElement.cloneNode(true) as SVGSVGElement;

    //     // If rotation is applied, set up the transform
    //     if (rotation !== 0) {
    //         // Calculate the center of the selection in SVG coordinates
    //         const selectionCenterX = adjustedLeft + svgSelectionWidth / 2;
    //         const selectionCenterY = adjustedTop + svgSelectionHeight / 2;

    //         // Apply transform to the group: first translate to origin, then rotate, then translate back
    //         contentGroup.setAttribute('transform',
    //             `translate(${selectionCenterX}, ${selectionCenterY}) 
    //          rotate(${rotation}) 
    //          translate(${-selectionCenterX}, ${-selectionCenterY})`);
    //     }

    //     // Move all child nodes to the content group
    //     while (originalContent.firstChild) {
    //         contentGroup.appendChild(originalContent.firstChild);
    //     }

    //     // Add content group to the selection SVG
    //     selectionSvg.appendChild(contentGroup);

    //     // Calculate the aspect ratio for PDF page orientation
    //     const aspectRatio = isRotated90or270 ?
    //         svgSelectionHeight / svgSelectionWidth :
    //         svgSelectionWidth / svgSelectionHeight;

    //     // Create PDF with appropriate orientation
    //     const pdf = new jsPDF(aspectRatio > 1 ? 'l' : 'p', 'mm', 'a4');
    //     const pdfWidth = pdf.internal.pageSize.getWidth();
    //     const pdfHeight = pdf.internal.pageSize.getHeight();

    //     // Calculate dimensions for fitting to page with margins
    //     const margins = 20; // 10mm margins on each side
    //     let renderWidth, renderHeight;

    //     if (aspectRatio > pdfWidth / pdfHeight) {
    //         // Width-constrained
    //         renderWidth = pdfWidth - margins;
    //         renderHeight = renderWidth / aspectRatio;
    //     } else {
    //         // Height-constrained
    //         renderHeight = pdfHeight - margins;
    //         renderWidth = renderHeight * aspectRatio;
    //     }

    //     // Center on page
    //     const x = (pdfWidth - renderWidth) / 2;
    //     const y = (pdfHeight - renderHeight) / 2;

    //     console.log({
    //         rotation: `${rotation}°`,
    //         isRotated90or270,
    //         originalDimensions: `${svgWidth}×${svgHeight}`,
    //         selectionBox,
    //         screenCoords: `${screenLeft},${screenTop} ${selectionScreenWidth}×${selectionScreenHeight}`,
    //         svgCoords: `${adjustedLeft},${adjustedTop} ${svgSelectionWidth}×${svgSelectionHeight}`,
    //         viewBox: selectionSvg.getAttribute('viewBox'),
    //         svgDimensions: `${selectionSvg.getAttribute('width')}×${selectionSvg.getAttribute('height')}`,
    //         aspectRatio,
    //         pdfSize: `${pdfWidth}mm × ${pdfHeight}mm`,
    //         renderSize: `${renderWidth}mm × ${renderHeight}mm`,
    //     });

    //     try {
    //         await svg2pdf(selectionSvg, pdf, {
    //             x, y, width: renderWidth, height: renderHeight
    //         });
    //         pdf.save(`${fileName}.pdf`);
    //     } catch (error) {
    //         console.error('Error generating PDF:', error);
    //     }
    // }, [selectionBox, zoom, offset, rotation, designRef]);

    const generateFitToPaperPDF = useCallback(async (fileName: string): Promise<void> => {
        const svgElement = designRef.current;
        if (!svgElement) {
            console.error('SVG element not found');
            return;
        }

        // Get the original viewBox dimensions
        const originalViewBox = svgElement.viewBox.baseVal;
        const fullWidth = originalViewBox.width;
        const fullHeight = originalViewBox.height;

        // Determine if we're dealing with a 90/270 degree rotation
        const isRotated90or270 = rotation === 90 || rotation === 270;

        // Create a new SVG that's pre-rotated rather than using transform
        const preRotatedSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        // For 90/270 rotations, we swap width and height and adjust the viewBox
        const effectiveWidth = isRotated90or270 ? fullHeight : fullWidth;
        const effectiveHeight = isRotated90or270 ? fullWidth : fullHeight;

        // Set up the new SVG with appropriate dimensions
        preRotatedSvg.setAttribute('width', `${effectiveWidth}`);
        preRotatedSvg.setAttribute('height', `${effectiveHeight}`);

        // Choose PDF orientation based on the effective aspect ratio
        const effectiveAspectRatio = effectiveWidth / effectiveHeight;
        const pdf = new jsPDF(effectiveAspectRatio > 1 ? 'l' : 'p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Calculate dimensions for fit-to-paper
        let renderWidth, renderHeight;
        if (effectiveAspectRatio > pdfWidth / pdfHeight) {
            // Width-constrained
            renderWidth = pdfWidth - 20; // 10mm padding on each side
            renderHeight = renderWidth / effectiveAspectRatio;
        } else {
            // Height-constrained
            renderHeight = pdfHeight - 20; // 10mm padding on each side
            renderWidth = renderHeight * effectiveAspectRatio;
        }

        // Center on page
        const x = (pdfWidth - renderWidth) / 2;
        const y = (pdfHeight - renderHeight) / 2;

        try {
            // Clone the original SVG content
            const content = svgElement.cloneNode(true) as SVGSVGElement;

            // Create a container group in our new SVG
            const contentGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');

            // Set up the viewBox for the new SVG, accounting for zoom and offset
            if (isRotated90or270) {
                // For 90/270 rotations, we need to adjust the viewBox
                preRotatedSvg.setAttribute('viewBox', `0 0 ${fullHeight * zoom} ${fullWidth * zoom}`);

                // Apply transformations to pre-rotate the content
                if (rotation === 90) {
                    // For 90° rotation: translate down then rotate
                    contentGroup.setAttribute('transform',
                        `translate(${fullHeight * zoom}, 0) rotate(90)`);
                } else { // rotation === 270
                    // For 270° rotation: translate right then rotate
                    contentGroup.setAttribute('transform',
                        `translate(0, ${fullWidth * zoom}) rotate(270)`);
                }
            } else {
                // For 0/180 rotations, use original dimensions
                preRotatedSvg.setAttribute('viewBox',
                    `${offset.x * zoom} ${offset.y * zoom} ${fullWidth * zoom} ${fullHeight * zoom}`);

                if (rotation === 180) {
                    // For 180° rotation: rotate around center point
                    const centerX = fullWidth / 2;
                    const centerY = fullHeight / 2;
                    contentGroup.setAttribute('transform',
                        `rotate(180, ${centerX}, ${centerY})`);
                }
            }

            // Copy all content from the original SVG to our content group
            while (content.firstChild) {
                contentGroup.appendChild(content.firstChild);
            }

            // Add the content group to our pre-rotated SVG
            preRotatedSvg.appendChild(contentGroup);

            console.log({
                rotation: `${rotation}°`,
                isRotated90or270,
                originalDimensions: `${fullWidth}×${fullHeight}`,
                effectiveDimensions: `${effectiveWidth}×${effectiveHeight}`,
                pdfSize: `${pdfWidth}mm × ${pdfHeight}mm`,
                renderSize: `${renderWidth}mm × ${renderHeight}mm`,
                aspectRatio: effectiveAspectRatio
            });

            // Use the pre-rotated SVG for PDF generation
            await svg2pdf(preRotatedSvg, pdf, {
                x, y, width: renderWidth, height: renderHeight
            });

            pdf.save(`${fileName}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    }, [zoom, offset, rotation]);


    useEffect(() => {
        console.log(offset);
    }, [offset])

    return (
        <main className="h-screen fixed w-screen">
            <SideMenu />
            <ActionBar generatePDF={generateFitToPaperPDF} />
            <View
                generatePDF={generateFitToPaperPDF}
                dimensions={dimensions}
                setDimensions={setDimensions}
                zoom={zoom}
                setZoom={setZoom}
                offset={offset}
                setOffset={setOffset}
                reference={designRef as React.RefObject<SVGSVGElement>}
                selectionBox={selectionBox}
            />
        </main>
    );
};

export default ContentWrapper;