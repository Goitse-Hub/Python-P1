# process_excel.py
import pandas as pd
import xml.etree.ElementTree as ET

def excel_to_xml(excel_file_path, xml_output_path):
    # Read the Excel file into a Pandas DataFrame
    df = pd.read_excel(excel_file_path)

    # Create an XML root element
    root = ET.Element("data")

    # Convert each row in the DataFrame to an XML element
    for _, row in df.iterrows():
        item = ET.SubElement(root, "item")
        for col_name, col_value in row.items():
            sub_element = ET.SubElement(item, col_name)
            sub_element.text = str(col_value)

    # Create an ElementTree and write to XML file
    tree = ET.ElementTree(root)
    tree.write(xml_output_path)

if __name__ == "__main__":
    excel_file_path = "path/to/your/input_excel_file.xlsx"
    xml_output_path = "path/to/your/output.xml"

    excel_to_xml(excel_file_path, xml_output_path)
