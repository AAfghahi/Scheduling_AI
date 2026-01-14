package reactors;

import prerna.reactor.AbstractReactor;
import prerna.sablecc2.om.PixelDataType;
import prerna.sablecc2.om.nounmeta.NounMetadata;

import java.io.File;
import java.io.FileInputStream;

import java.util.List;
import java.util.ArrayList;
import java.util.Iterator;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

public class UploadParentScheduleReactor extends AbstractReactor {

  public UploadParentScheduleReactor() {
    this.keysToGet = new String[] { "FILE_PATH" };
    this.keyRequired = new int[] { 1 };
  }

  public static List<String> holidayKeys = List.of("Firm Holiday", "PTO");

  @Override
  public NounMetadata execute() {

    organizeKeys();
    String filePath = (String) this.keyValue.get("FILE_PATH");
    List<String> result = new ArrayList<>();

    try {
      String absolutePath = this.insight.getAbsoluteInsightFolderPath(filePath);
      File file = new File(absolutePath);
      FileInputStream fis = new FileInputStream(file);
      Workbook workbook = new XSSFWorkbook(fis);

      for (int i = 1; i < workbook.getNumberOfSheets(); i++) {
        Sheet sheet = workbook.getSheetAt(i);

        Iterator<Row> rowIterator = sheet.iterator();
        while (rowIterator.hasNext()) {
          Row row = rowIterator.next();
          int currentRowIndex = row.getRowNum();

          if (currentRowIndex < 4) { // skip header rows
            continue;
          }

          Iterator<Cell> cellIterator = row.cellIterator();
          while (cellIterator.hasNext()) {
            Cell dateCell = cellIterator.next();
            if (dateCell != null && dateCell.getCellType() != CellType.BLANK) {
              int cellIndex = dateCell.getColumnIndex();
              Row nextRow = sheet.getRow(currentRowIndex + 1);
              if (nextRow != null) {
                Cell nextRowCell = nextRow.getCell(cellIndex);

                if (nextRowCell != null &&
                    nextRowCell.getCellType() == CellType.STRING &&
                    holidayKeys.contains(nextRowCell.getStringCellValue().trim())) {
                  result.add(dateCell.getDateCellValue().toInstant()
                      .atZone(java.time.ZoneId.systemDefault())
                      .toLocalDate().toString());
                }
              }
            }
          }
        }
      }

      workbook.close();
      fis.close();
    } catch (Exception e) {
      e.printStackTrace();
    }

    return new NounMetadata(result, PixelDataType.CUSTOM_DATA_STRUCTURE);

  }
}
