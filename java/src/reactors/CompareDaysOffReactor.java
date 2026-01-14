package reactors;

import prerna.reactor.AbstractReactor;
import prerna.sablecc2.om.GenRowStruct;
import prerna.sablecc2.om.PixelDataType;
import prerna.sablecc2.om.nounmeta.NounMetadata;

import java.util.List;
import java.util.ArrayList;
import java.util.Collections;



public class CompareDaysOffReactor extends AbstractReactor {

  public CompareDaysOffReactor() {
    this.keysToGet = new String[] { "PARENT_DAYS_OFF", "CHILD_DAYS_OFF" };
    this.keyRequired = new int[] { 1, 1 };
  }

  @Override
  public NounMetadata execute() {
    organizeKeys();

    GenRowStruct childList = this.store.getNoun("PARENT_DAYS_OFF");
    GenRowStruct parentList = this.store.getNoun("CHILD_DAYS_OFF");
    List<String> result = new ArrayList<>();

    List<NounMetadata> childMap = childList.getNounsOfType(PixelDataType.CONST_STRING);
    List<NounMetadata> parentMap = parentList.getNounsOfType(PixelDataType.CONST_STRING);

    for(NounMetadata childDayOff : childMap) {
        for(NounMetadata parentDayOff : parentMap) {
            if((childDayOff.getValue().toString()).equals(parentDayOff.getValue().toString())) {
                result.add(childDayOff.getValue().toString());
            }
        }
       
    }

    Collections.sort(result);

    return new NounMetadata(result, PixelDataType.CUSTOM_DATA_STRUCTURE);

  }
}
