package prerna;

import prerna.reactor.AbstractReactor;
import prerna.sablecc2.om.ReactorKeysEnum;
import prerna.sablecc2.om.nounmeta.NounMetadata;
import prerna.util.Constants;

import java.io.File;
import java.io.FileInputStream;
import java.util.UUID;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

public class UploadScheduleReactor extends AbstractReactor {

  public UploadScheduleReactor() {
    this.keysToGet = new String[] { "FILE_PATH" };
    this.keyRequired = new int[] { 1 };
  }

  public static Map<String, String> holidayKeys = new HashMap<String, String>() {
    {
      put("F", "First Day of School");
      put("L", "Last Day of School");
      put("H", "Holidays");
      put("SH", "Student Holiday");
    }
  };

  @Override
  public NounMetadata execute() {

    /*
     * PARAMS:
     * excel file path
     * 
     * RETURN:
     * object [ 'yy-yy-yyyy', 'yy-yy-yyyy' ... ] // dates for each month
     * 
     */

    organizeKeys();
    String filePath;
    List<LocalDate> resultMap = new ArrayList<>();
    boolean vacation = false;
    try {

      filePath = this.keyValue.get(ReactorKeysEnum.FILE_PATH.getKey().toString());
      File file = new File(this.insight.getAbsoluteInsightFolderPath(filePath)); // get file from insight cache
      FileInputStream fis = new FileInputStream(file);
      Workbook workbook = new XSSFWorkbook(fis);

      for (int i = 0; i < workbook.getNumberOfSheets(); i++) { // loop through sheets to process all months
        Sheet sheet = workbook.getSheetAt(i);
        System.out.println("Processing sheet: " + sheet.getSheetName());

        Row headerMonth = sheet.getRow(1); // get month and year from 2nd row
        String calendarDate = headerMonth.getCell(1).getStringCellValue().trim(); // "January 2026"
        // separate month and year?
        String[] parts = calendarDate.split(" ");
        String month = parts[0];
        String year = parts[1];
        System.out.println("Month: " + month + ", Year: " + year);

        System.out.println("sheet name: " + sheet.getSheetName());

        Iterator<Row> rowIterator = sheet.iterator();
        while (rowIterator.hasNext()) {
          Row row = rowIterator.next();
          int currentRowIndex = row.getRowNum();
          if (currentRowIndex < 4) { // skip first 4 rows (headers)
            continue;
          }
          Iterator<Cell> cellIterator = row.cellIterator();
          while (cellIterator.hasNext()) {
            Cell dateCell = cellIterator.next();
            if (dateCell.getCellType() != CellType.BLANK) {
              System.out.print(
                  "date cell value: " + dateCell.getStringCellValue().trim() + " cell column #: "
                      + dateCell.getColumnIndex());
              int cellIndex = dateCell.getColumnIndex(); // current index (column, row)
              Row nextRow = sheet.getRow(currentRowIndex + 1); // row + 1
              Cell nextRowCell = nextRow.getCell(cellIndex); // (column, row + 1)
              if ((nextRowCell.getCellType() != CellType.BLANK)
                  && (holidayKeys.containsKey(nextRowCell.getStringCellValue().trim()))) {

                // if (nextRowCell.getStringCellValue().trim().equals("L")) {
                // vacation = true;
                // } else if (nextRowCell.getStringCellValue().trim().equals("F")) {
                // vacation = false;
                // }

                System.out
                    .println("holiday date and type: " + holidayKeys.get(dateCell.getStringCellValue().trim()) + ", "
                        + nextRowCell.getStringCellValue().trim());

                // String dateString = dateCell.getStringCellValue().trim() + " " + month + " "
                // + year;
                // DateTimeFormatter formatter = DateTimeFormatter.ofPattern("d MMMM yyyy");
                // LocalDate date = LocalDate.parse(dateString, formatter);
                // resultMap.add(date);

              }

            }

          }
        }
        workbook.close();
      }
    } catch (Exception e) {
      e.printStackTrace();
    }

    return null;

  }
}
